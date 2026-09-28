import Phaser from 'phaser';
import { gameBridge } from '../bridge';
import { MEADOW } from '../../domain/maps/meadow';
import { OBJECTS } from '../../domain/objects/catalog';
import { drawTerrain, drawCabin, drawPlayer, drawTree, drawResource } from '../rendering/art';

export class MeadowScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private shadow!: Phaser.GameObjects.Ellipse;
  private selection!: Phaser.GameObjects.Ellipse;
  private destination!: Phaser.GameObjects.Ellipse;
  private nodes = new Map<string, Phaser.GameObjects.Container>();
  private target = { ...MEADOW.spawn } as { x: number; y: number };
  private walking = false;
  private pollen: Phaser.GameObjects.Arc[] = [];
  private unsubscribe?: () => void;
  private lastRefresh = 0;
  constructor() { super('meadow'); }

  create() {
    this.cameras.main.setBackgroundColor('#e7ecd9');
    drawTerrain(this);
    [[170,630,0.9,0],[183,507,1.1,1],[274,421,1,0],[407,428,0.85,0],[533,462,1.1,1],[667,538,0.95,0],[754,651,0.85,1],[119,800,0.8,0],[157,951,0.9,1],[294,1068,0.8,0],[597,1079,0.85,0],[745,1027,0.75,1]].forEach(([x,y,s,k]) => drawTree(this,x,y,s,k));
    drawCabin(this);
    this.selection = this.add.ellipse(0, 0, 115, 49).setStrokeStyle(3, 0xfff9de, 0.95).setDepth(1).setVisible(false);
    for (const object of OBJECTS) {
      const ring = this.add.ellipse(0, 6, 89, 34, 0xfaf4d9, 0.42).setStrokeStyle(1.5, 0xfaf4d9, 0.7);
      const art = drawResource(this, object.kind);
      const node = this.add.container(object.x, object.y, [ring, art]).setDepth(object.y);
      node.setSize(130, 130).setInteractive(new Phaser.Geom.Circle(65, 65, 65), Phaser.Geom.Circle.Contains);
      node.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        gameBridge.select(object.id);
      });
      this.nodes.set(object.id, node);
    }
    const state = gameBridge.snapshot();
    this.target = { ...state.data.player.position };
    this.shadow = this.add.ellipse(this.target.x, this.target.y + 2, 46, 18, 0x53664b, 0.19);
    this.player = drawPlayer(this).setPosition(this.target.x, this.target.y).setDepth(this.target.y + 1);
    this.destination = this.add.ellipse(0, 0, 25, 11).setStrokeStyle(2, 0xfff9dd, 0.85).setVisible(false).setDepth(0);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (over.length > 0) return;
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const area = MEADOW.walkArea;
      const ellipse = new Phaser.Geom.Ellipse(area.x, area.y, area.width, area.height);
      if (!Phaser.Geom.Ellipse.Contains(ellipse, point.x, point.y)) { gameBridge.select(null); return; }
      // The pool is scenery, not walkable. More elaborate navigation is stage 02.
      if (Phaser.Geom.Ellipse.Contains(new Phaser.Geom.Ellipse(678, 864, 195, 295), point.x, point.y)) return;
      gameBridge.select(null);
      this.target = { x: point.x, y: point.y };
      this.walking = true;
      this.destination.setPosition(point.x, point.y).setVisible(true);
      // Persist destination immediately, so closing mid-walk never loses the tap.
      gameBridge.move(this.target);
    });
    for (let i = 0; i < 9; i++) this.pollen.push(this.add.circle(0, 0, 2 + i % 2, 0xffffe8, 0.65).setDepth(2000));
    this.unsubscribe = gameBridge.subscribe((next, previous) => {
      if (next.data.player.position !== previous.data.player.position && !this.walking) {
        this.target = { ...next.data.player.position };
        this.player.setPosition(this.target.x, this.target.y);
      }
      this.refreshObjects();
    });
    this.scale.on('resize', this.resizeScene, this);
    this.events.once('shutdown', () => { this.unsubscribe?.(); this.scale.off('resize', this.resizeScene, this); });
    this.resizeScene(); this.refreshObjects();
  }

  private resizeScene() {
    const { width, height } = this.scale;
    const zoom = Math.min(width / 825, Math.max(200, height - 140) / 960);
    this.cameras.main.setZoom(zoom).centerOn(450, 733);
  }

  private refreshObjects() {
    const state = gameBridge.snapshot();
    for (const object of OBJECTS) {
      const ready = (state.data.objects[object.id]?.availableAt ?? 0) <= Date.now();
      this.nodes.get(object.id)?.setAlpha(ready ? 1 : 0.48);
    }
    const selected = OBJECTS.find(object => object.id === state.selectedId);
    this.selection.setVisible(!!selected);
    if (selected) this.selection.setPosition(selected.x, selected.y + 7).setDepth(selected.y - 1);
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    const reduced = gameBridge.snapshot().data.settings.reducedMotion;
    if (this.walking) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      const step = reduced ? distance : 230 * Math.min(delta, 40) / 1000;
      if (distance <= step) {
        this.player.setPosition(this.target.x, this.target.y); this.walking = false; this.destination.setVisible(false);
      } else {
        this.player.x += (this.target.x - this.player.x) / distance * step;
        this.player.y += (this.target.y - this.player.y) / distance * step;
      }
      this.player.setDepth(this.player.y + 1);
      (this.player.first as Phaser.GameObjects.Graphics).y = reduced ? 0 : Math.sin(time / 65) * 2;
    } else (this.player.first as Phaser.GameObjects.Graphics).y = reduced ? 0 : Math.sin(time / 700) * 1.1;
    this.shadow.setPosition(this.player.x, this.player.y + 2).setDepth(this.player.y - 1);
    this.pollen.forEach((dot, i) => {
      dot.setVisible(!reduced);
      dot.setPosition(200 + (i * 91 + time * 0.011) % 535, 415 + (i * 71) % 570 + Math.sin(time / 1500 + i) * 16);
    });
    if (time - this.lastRefresh > 500) { this.refreshObjects(); this.lastRefresh = time; }
  }
}
