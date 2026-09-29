import Phaser from 'phaser';
import { gameBridge } from '../bridge';
import { MEADOW, findWorldObject } from '../../domain/maps/meadow';
import type { SceneryObject } from '../../domain/maps/types';
import type { Position } from '../../domain/player/types';
import { meadowNavigation } from '../../domain/maps/navigation';
import { contains } from '../navigation/NavigationGrid';
import { groveOpen, navigationKey, objectPresent } from '../../domain/exploration/worldState';
import { createWorldTextures, drawWorldGround, ART } from '../rendering/worldArt';
import { Explorer } from '../characters/Explorer';
import { WorldCamera } from '../camera/WorldCamera';
import { ExplorationEffects } from '../effects/ExplorationEffects';

export class MeadowScene extends Phaser.Scene {
  private explorer!: Explorer;
  private worldCamera!: WorldCamera;
  private effects!: ExplorationEffects;
  private fog!: Phaser.GameObjects.Graphics;
  private navigation = meadowNavigation(gameBridge.snapshot().data);
  private route: Position[] = [];
  private waypoint = 0;
  private scenery: { data: SceneryObject; image: Phaser.GameObjects.Image }[] = [];
  private retiring = new Map<string, number>();
  private ring!: Phaser.GameObjects.Ellipse;
  private destination!: Phaser.GameObjects.Ellipse;
  private unsubscribe?: () => void;
  private saving = false;
  private lastSave = 0;
  private lastCull = 0;
  private motes: Phaser.GameObjects.Arc[] = [];
  private selected: string | null = null;
  private pendingAction: string | null = null;
  private gesture = { dragging: false, lastX: 0, lastY: 0, pinchDistance: 0 };
  private hide = () => { if (document.hidden) this.checkpoint(); };
  private pageHide = () => this.checkpoint();
  constructor() { super('meadow'); }

  create() {
    createWorldTextures(this); drawWorldGround(this);
    this.cameras.main.setBackgroundColor('#9fbb79');
    this.effects = new ExplorationEffects(this);
    for (const object of MEADOW.objects) {
      const spec = ART[object.kind];
      const image = this.add.image(object.x, object.y, `world-${object.kind}`).setOrigin(.5, spec.foot/spec.h).setScale(object.scale).setDepth(object.y);
      if (object.interaction) {
        image.setInteractive({ useHandCursor: true });
        image.on('pointerup', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation();
          if (pointer.getDistance()>15 || !objectPresent(object, gameBridge.snapshot().data)) return;
          gameBridge.select(object.id);
        });
      }
      image.setVisible(objectPresent(object, gameBridge.snapshot().data));
      this.scenery.push({ data: object, image });
    }
    this.fog = this.add.graphics().setDepth(2600);
    this.fog.fillStyle(0x718f68, .96).fillEllipse(1180, 190, 660, 850);
    for (let i=0; i<9; i++) this.fog.fillStyle(i%2?0x9bb183:0x829f72, .7).fillEllipse(955+i*55, 510+Math.sin(i)*24, 155, 110);
    this.fog.setVisible(!groveOpen(gameBridge.snapshot().data));
    this.explorer = new Explorer(this, this.navigation.safePosition(gameBridge.snapshot().data.player.position));
    this.worldCamera = new WorldCamera(this.cameras.main, MEADOW, this.explorer.root);
    this.ring = this.add.ellipse(0,0,90,36).setStrokeStyle(3,0xfff1bb,.95).setVisible(false);
    this.destination = this.add.ellipse(0,0,23,12).setStrokeStyle(2,0xfff5cb,.85).setVisible(false).setDepth(-1);
    for(let i=0;i<7;i++) this.motes.push(this.add.circle(0,0,2,0xfff3b8,.7).setDepth(3000));
    // One finger pans the world; two fingers pinch to zoom. Add a second touch pointer explicitly.
    this.input.addPointer(1);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.gesture.lastX = pointer.x; this.gesture.lastY = pointer.y;
      const active = [this.input.pointer1, this.input.pointer2].filter((p): p is Phaser.Input.Pointer => Boolean(p?.isDown));
      if (active.length >= 2) this.gesture.pinchDistance = Phaser.Math.Distance.Between(active[0].x, active[0].y, active[1].x, active[1].y);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || document.querySelector('dialog[open]')) return;
      const active = [this.input.pointer1, this.input.pointer2].filter((p): p is Phaser.Input.Pointer => Boolean(p?.isDown));
      if (active.length >= 2) {
        const distance = Phaser.Math.Distance.Between(active[0].x, active[0].y, active[1].x, active[1].y);
        if (this.gesture.pinchDistance > 0 && distance > 0) {
          this.worldCamera.zoomBy(distance / this.gesture.pinchDistance);
          this.gesture.dragging = true;
        }
        this.gesture.pinchDistance = distance;
        return;
      }
      const dx = pointer.x - this.gesture.lastX, dy = pointer.y - this.gesture.lastY;
      if (pointer.getDistance() > 12) {
        this.worldCamera.panByScreen(dx, dy);
        this.gesture.dragging = true;
      }
      this.gesture.lastX = pointer.x; this.gesture.lastY = pointer.y;
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      const wasGesture = this.gesture.dragging || pointer.getDistance() > 15;
      if (![this.input.pointer1, this.input.pointer2].some(p => p?.isDown)) { this.gesture.dragging = false; this.gesture.pinchDistance = 0; }
      if(over.length || wasGesture || document.querySelector('dialog[open]')) return;
      const p = this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      if(!this.navigation.isWalkable(p)) { gameBridge.notify('Esse trecho ainda está fechado. Siga pela clareira ou limpe os obstáculos.'); return; }
      const route = this.navigation.findPath(this.explorer.position,p);
      if(!route) { gameBridge.notify('Ainda não há passagem até ali.'); return; }
      gameBridge.select(null); this.pendingAction=null; this.worldCamera.resumeFollow(); this.beginRoute(route,p);
    });
    this.unsubscribe = gameBridge.subscribe((next, previous) => {
      if (navigationKey(next.data)!==navigationKey(previous.data)) {
        this.navigation = meadowNavigation(next.data);
        this.route=[]; this.pendingAction=null; this.destination.setVisible(false);
        this.explorer.setPosition(this.navigation.safePosition(this.explorer.position));
        if(groveOpen(next.data)) {
          this.tweens.add({ targets: this.fog, alpha: 0, duration: next.data.settings.reducedMotion?0:700, onComplete: () => this.fog.setVisible(false) });
        } else this.fog.setAlpha(1).setVisible(true);
        for (const {data,image} of this.scenery) if(objectPresent(data,next.data) && !objectPresent(data,previous.data)) image.setScale(data.scale).setAlpha(1).setAngle(0).setVisible(true);
      }
      if(next.selectedId!==previous.selectedId) this.selectObject(next.selectedId);
      const a=next.data.player.position,b=previous.data.player.position;
      if(!this.saving && (a.x!==b.x || a.y!==b.y)) {
        this.route=[]; this.pendingAction=null;
        this.explorer.setPosition(this.navigation.safePosition(a)); this.destination.setVisible(false);
      }
      if(next.actionRequest && next.actionRequest!==previous.actionRequest) {
        this.selectObject(next.actionRequest.id); this.pendingAction=next.actionRequest.id;
      }
      if(next.feedback && next.feedback!==previous.feedback) {
        const event=next.feedback, item=this.scenery.find(item=>item.data.id===event.objectId);
        if(event.removed && item) { this.retiring.set(item.data.id,this.time.now+360); item.image.setVisible(true); }
        this.effects.play(event, item?.data??this.explorer.position, item?.image, next.data.settings.reducedMotion);
      }
      if(next.data.settings.reducedMotion!==previous.data.settings.reducedMotion) this.worldCamera.setReducedMotion(next.data.settings.reducedMotion);
    });
    this.scale.on('resize',this.resizeScene,this);
    document.addEventListener('visibilitychange',this.hide); window.addEventListener('pagehide',this.pageHide);
    this.events.once('shutdown',()=>{
      this.checkpoint(); this.unsubscribe?.(); this.scale.off('resize',this.resizeScene,this);
      document.removeEventListener('visibilitychange',this.hide); window.removeEventListener('pagehide',this.pageHide);
      gameBridge.anchor(null); this.scenery=[]; this.motes=[]; this.retiring.clear();
    });
    this.resizeScene(); this.checkpoint();
  }
  private resizeScene() {
    if(!this.worldCamera) return;
    this.worldCamera.resize(this.scale.width,this.scale.height);
    this.worldCamera.setReducedMotion(gameBridge.snapshot().data.settings.reducedMotion);
  }
  private beginRoute(route: Position[], destination: Position) {
    this.route=route; this.waypoint=0; this.destination.setPosition(destination.x,destination.y).setVisible(true);
  }
  private selectObject(id: string|null) {
    this.selected=id; this.pendingAction=null;
    const object=id?findWorldObject(id):undefined;
    if(!object?.interaction) { this.ring.setVisible(false); gameBridge.anchor(null); return; }
    this.ring.setPosition(object.x,object.y+4).setSize(Math.min(180,ART[object.kind].w*.65*object.scale),40).setDepth(object.y-.5).setVisible(true);
    const destination=this.navigation.safePosition(object.interaction.approach);
    const route=this.navigation.findPath(this.explorer.position,destination);
    if(route) this.beginRoute(route,destination);
    else { this.route=[]; gameBridge.notify('Limpe os obstáculos mais próximos primeiro.'); }
  }
  private checkpoint() {
    if(!this.explorer) return;
    const p=this.explorer.position,saved=gameBridge.snapshot().data.player.position;
    if(Math.hypot(saved.x-p.x,saved.y-p.y)<.1) return;
    this.saving=true; gameBridge.move(p); this.saving=false;
  }
  update(time: number, delta: number) {
    if(!this.explorer) return;
    const before=this.explorer.position; let budget=185*Math.min(delta,40)/1000;
    while(this.waypoint<this.route.length && budget>0) {
      const p=this.explorer.position,target=this.route[this.waypoint],distance=Math.hypot(target.x-p.x,target.y-p.y);
      const step=Math.min(budget,distance),next=distance<.001?target:{x:p.x+(target.x-p.x)*step/distance,y:p.y+(target.y-p.y)*step/distance};
      if(!this.navigation.segmentClear(p,next)) { this.route=[];this.pendingAction=null;this.destination.setVisible(false);this.checkpoint();break; }
      this.explorer.setPosition(next);budget-=step;
      if(distance<=step+.01) { this.waypoint++;if(this.waypoint===this.route.length) { this.destination.setVisible(false);this.checkpoint();if(this.selected)gameBridge.visit(this.selected); } }
    }
    if(this.pendingAction && this.waypoint>=this.route.length) {
      const id=this.pendingAction; this.pendingAction=null; this.checkpoint(); gameBridge.interact(id);
    }
    const p=this.explorer.position,data=gameBridge.snapshot().data,reduced=data.settings.reducedMotion;
    this.explorer.animate(p.x-before.x,p.y-before.y,delta,time,reduced);
    if(time-this.lastSave>1200) {this.checkpoint();this.lastSave=time;}
    if(time-this.lastCull>140) {
      const camera=this.cameras.main,view=camera.worldView;
      for(const {data:object,image} of this.scenery) {
        const retiring=(this.retiring.get(object.id)??0)>time;
        if(!retiring)this.retiring.delete(object.id);
        const visible=(retiring||objectPresent(object,data)) && object.x>view.x-300 && object.x<view.right+300 && object.y>view.y-50 && object.y<view.bottom+380;
        image.setVisible(visible);
        if(visible&&!retiring) {const canopy=['tree','pine','goldTree'].includes(object.kind);image.setAlpha(canopy&&p.y<object.y&&p.y>object.y-210*object.scale&&Math.abs(p.x-object.x)<75*object.scale?.56:1);}
      }
      const zone=MEADOW.zones.find(zone=>contains(zone.bounds,p));gameBridge.zone(zone?.name??MEADOW.name);
      const selected=this.selected?findWorldObject(this.selected):null;
      if(selected)gameBridge.anchor({x:(selected.x-view.x)*camera.zoom,y:(selected.y-view.y)*camera.zoom});
      this.lastCull=time;
    }
    this.motes.forEach((dot,i)=>{dot.setVisible(!reduced);dot.setPosition(p.x-290+(i*101+time*.006)%600,p.y-170+(i*73)%330+Math.sin(time/1600+i)*12);});
  }
}
