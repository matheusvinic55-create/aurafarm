import Phaser from 'phaser';
import { gameBridge } from '../bridge';
import { MEADOW, findWorldObject } from '../../domain/maps/meadow';
import type { SceneryObject } from '../../domain/maps/types';
import type { Position } from '../../domain/player/types';
import { meadowNavigation } from '../../domain/maps/navigation';
import { contains } from '../navigation/NavigationGrid';
import { createWorldTextures, drawWorldGround, ART } from '../rendering/worldArt';
import { Explorer } from '../characters/Explorer';
import { WorldCamera } from '../camera/WorldCamera';

export class MeadowScene extends Phaser.Scene{
 private explorer!:Explorer;private worldCamera!:WorldCamera;
 private navigation=meadowNavigation();private route:Position[]=[];private waypoint=0;
 private scenery:{data:SceneryObject;image:Phaser.GameObjects.Image}[]=[];
 private ring!:Phaser.GameObjects.Ellipse;private destination!:Phaser.GameObjects.Ellipse;
 private unsubscribe?:()=>void;private saving=false;private lastSave=0;private lastCull=0;
 private motes:Phaser.GameObjects.Arc[]=[];private selected:string|null=null;
 private hide=()=>{if(document.hidden)this.checkpoint();};private pageHide=()=>this.checkpoint();
 constructor(){super('meadow');}
 create(){
  createWorldTextures(this);drawWorldGround(this);this.cameras.main.setBackgroundColor('#9fbb79');
  for(const object of MEADOW.objects){
   const spec=ART[object.kind],image=this.add.image(object.x,object.y,`world-${object.kind}`).setOrigin(.5,spec.foot/spec.h).setScale(object.scale).setDepth(object.y);
   if(object.interaction){image.setInteractive({useHandCursor:true});image.on('pointerup',(pointer:Phaser.Input.Pointer,_x:number,_y:number,event:Phaser.Types.Input.EventData)=>{event.stopPropagation();if(pointer.getDistance()>15)return;gameBridge.select(object.id);});}
   this.scenery.push({data:object,image});
  }
  const position=this.navigation.safePosition(gameBridge.snapshot().data.player.position);
  this.explorer=new Explorer(this,position);this.worldCamera=new WorldCamera(this.cameras.main,MEADOW,this.explorer.root);
  this.ring=this.add.ellipse(0,0,90,36).setStrokeStyle(3,0xfff1bb,.95).setVisible(false);
  this.destination=this.add.ellipse(0,0,23,12).setStrokeStyle(2,0xfff5cb,.85).setVisible(false).setDepth(-1);
  for(let i=0;i<7;i++)this.motes.push(this.add.circle(0,0,2,0xfff3b8,.7).setDepth(3000));
  this.input.on('pointerup',(pointer:Phaser.Input.Pointer,over:Phaser.GameObjects.GameObject[])=>{
   if(over.length||pointer.getDistance()>15||document.querySelector('dialog[open]'))return;
   const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
   if(!this.navigation.isWalkable(p)){gameBridge.notify('Esse trecho ainda está fechado. Experimente seguir pela clareira.');return;}
   const route=this.navigation.findPath(this.explorer.position,p);
   if(!route){gameBridge.notify('Ainda não há passagem até ali.');return;}
   gameBridge.select(null);this.beginRoute(route,p);
  });
  this.unsubscribe=gameBridge.subscribe((next,previous)=>{
   if(next.selectedId!==previous.selectedId)this.selectObject(next.selectedId);
   const a=next.data.player.position,b=previous.data.player.position;
   if(!this.saving&&(a.x!==b.x||a.y!==b.y)){this.route=[];this.explorer.setPosition(this.navigation.safePosition(a));this.destination.setVisible(false);}
   if(next.data.settings.reducedMotion!==previous.data.settings.reducedMotion)this.worldCamera.setReducedMotion(next.data.settings.reducedMotion);
  });
  this.scale.on('resize',this.resizeScene,this);document.addEventListener('visibilitychange',this.hide);window.addEventListener('pagehide',this.pageHide);
  this.events.once('shutdown',()=>{this.checkpoint();this.unsubscribe?.();this.scale.off('resize',this.resizeScene,this);document.removeEventListener('visibilitychange',this.hide);window.removeEventListener('pagehide',this.pageHide);this.scenery=[];this.motes=[];});
  this.resizeScene();this.worldCamera.setReducedMotion(gameBridge.snapshot().data.settings.reducedMotion);this.checkpoint();
 }
 private resizeScene(){if(this.worldCamera){this.worldCamera.resize(this.scale.width,this.scale.height);this.worldCamera.setReducedMotion(gameBridge.snapshot().data.settings.reducedMotion);}}
 private beginRoute(route:Position[],destination:Position){this.route=route;this.waypoint=0;this.destination.setPosition(destination.x,destination.y).setVisible(true);}
 private selectObject(id:string|null){
  this.selected=id;const object=id?findWorldObject(id):undefined;
  if(!object?.interaction){this.ring.setVisible(false);return;}
  this.ring.setPosition(object.x,object.y+4).setSize(Math.min(180,ART[object.kind].w*.65*object.scale),40).setDepth(object.y-.5).setVisible(true);
  const destination=this.navigation.safePosition(object.interaction.approach);
  const route=this.navigation.findPath(this.explorer.position,destination);
  if(route)this.beginRoute(route,destination);else gameBridge.notify('Encontre uma passagem mais próxima para observar esse lugar.');
 }
 private checkpoint(){
  if(!this.explorer)return;const p=this.explorer.position;
  const saved=gameBridge.snapshot().data.player.position;
  if(Math.hypot(saved.x-p.x,saved.y-p.y)<.1)return;
  this.saving=true;gameBridge.move(p);this.saving=false;
 }
 update(time:number,delta:number){
  if(!this.explorer)return;const before=this.explorer.position;let budget=185*Math.min(delta,40)/1000;
  while(this.waypoint<this.route.length&&budget>0){const p=this.explorer.position,target=this.route[this.waypoint],distance=Math.hypot(target.x-p.x,target.y-p.y);
   const step=Math.min(budget,distance),next=distance<.001?target:{x:p.x+(target.x-p.x)*step/distance,y:p.y+(target.y-p.y)*step/distance};
   if(!this.navigation.segmentClear(p,next)){this.route=[];this.destination.setVisible(false);this.checkpoint();break;}
   this.explorer.setPosition(next);budget-=step;
   if(distance<=step+.01){this.waypoint++;if(this.waypoint===this.route.length){this.destination.setVisible(false);this.checkpoint();if(this.selected)gameBridge.visit(this.selected);}}
  }
  const p=this.explorer.position,reduced=gameBridge.snapshot().data.settings.reducedMotion;
  this.explorer.animate(p.x-before.x,p.y-before.y,delta,time,reduced);
  if(time-this.lastSave>1200){this.checkpoint();this.lastSave=time;}
  if(time-this.lastCull>140){
   const view=this.cameras.main.worldView;
   for(const {data,image}of this.scenery){const visible=data.x>view.x-300&&data.x<view.right+300&&data.y>view.y-50&&data.y<view.bottom+380;image.setVisible(visible);if(visible){const canopy=['tree','pine','goldTree'].includes(data.kind);image.setAlpha(canopy&&p.y<data.y&&p.y>data.y-210*data.scale&&Math.abs(p.x-data.x)<75*data.scale ? .56 : 1);}}
   const zone=MEADOW.zones.find(zone=>contains(zone.bounds,p));gameBridge.zone(zone?.name??MEADOW.name);this.lastCull=time;
  }
  this.motes.forEach((dot,i)=>{dot.setVisible(!reduced);dot.setPosition(p.x-290+(i*101+time*.006)%600,p.y-170+(i*73)%330+Math.sin(time/1600+i)*12);});
 }
}
