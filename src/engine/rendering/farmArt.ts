import Phaser from 'phaser';
import { CROPS, PLOTS, STATIONS, type CropId } from '../../domain/farming/catalog';
import { cropStage } from '../../domain/farming/time';
import type { SaveData } from '../../persistence/schema';

type Stage = ReturnType<typeof cropStage>;
function texture(scene: Phaser.Scene, key: string, width: number, height: number, paint: (c: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const canvas = scene.textures.createCanvas(key, width, height)!;
  paint(canvas.context); canvas.refresh();
}
function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string) {
  c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
}
function round(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill();
}
function paintCrop(c: CanvasRenderingContext2D, crop: CropId, stage: Stage) {
  const ready = stage === 'ready';
  for (const [x, y] of [[29, 62], [63, 63], [96, 65], [42, 80], [82, 82]]) {
    if (stage === 'seed') { ellipse(c, x, y, 3, 2, '#d8bc86'); continue; }
    const h = stage === 'sprout' ? 10 : ready ? 39 : 24;
    const green = ready && crop === 'wheat' ? '#c8a153' : '#738d4c';
    c.strokeStyle = green; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y - h); c.stroke();
    ellipse(c, x - 5, y - h * .5, 6, 2.5, green); ellipse(c, x + 6, y - h * .75, 6, 3, green);
    if (crop === 'carrot') {
      if (ready) { c.fillStyle = '#da8c49'; c.beginPath(); c.moveTo(x - 5, y - 4); c.lineTo(x + 5, y - 4); c.lineTo(x, y + 7); c.fill(); }
      if (stage !== 'sprout') for (const offset of [-9, 0, 9]) {
        c.strokeStyle = '#547847'; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + offset, y - h * .7); c.stroke();
        ellipse(c, x + offset, y - h * .7, 5, 3, '#7f9e59');
      }
    } else if (crop === 'wheat' && stage !== 'sprout') {
      for (let i = 0; i < 4; i++) { ellipse(c, x - 3, y - h + i * 4, 4, 2.5, ready ? '#ebce79' : '#a4af65'); ellipse(c, x + 3, y - h + i * 4 - 2, 4, 2.5, ready ? '#e2bd64' : '#9aaa61'); }
    } else if (crop === 'corn' && stage !== 'sprout') {
      ellipse(c, x + 5, y - h * .55, 4, ready ? 10 : 6, ready ? '#e9c566' : '#a8b45e');
      c.strokeStyle = '#628149'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 5); c.quadraticCurveTo(x - 14, y - 28, x - 14, y - 18); c.stroke();
    }
  }
  if (ready) { ellipse(c, 112, 32, 10, 10, '#fbf1b5'); c.strokeStyle = '#798b4d'; c.lineWidth = 2; c.beginPath(); c.moveTo(107, 32); c.lineTo(111, 36); c.lineTo(117, 28); c.stroke(); }
}
function createFarmTextures(scene: Phaser.Scene) {
  for (const state of ['empty', 'prepared', 'wet']) texture(scene, `farm-soil-${state}`, 128, 110, c => {
    ellipse(c, 64, 80, 57, 25, '#52683930');
    round(c, 9, 45, 110, 53, 17, '#abb67b'); round(c, 12, 46, 104, 46, 14, state === 'empty' ? '#a5916a' : state === 'wet' ? '#79634c' : '#917353');
    c.strokeStyle = state === 'wet' ? '#65523e' : '#7c654b'; c.lineWidth = 3;
    for (let row = 0; row < 3; row++) { c.beginPath(); c.moveTo(23, 58 + row * 12); c.lineTo(104, 62 + row * 12); c.stroke(); }
    if (state === 'empty') { ellipse(c, 24, 84, 5, 3, '#c8bd97'); ellipse(c, 105, 53, 4, 3, '#c6b28e'); }
  });
  for (const crop of Object.keys(CROPS) as CropId[]) for (const stage of ['seed', 'sprout', 'growing', 'ready'] as Stage[]) {
    texture(scene, `farm-${crop}-${stage}`, 128, 110, c => paintCrop(c, crop, stage));
  }
  texture(scene, 'farm-kitchen', 186, 178, c => {
    ellipse(c, 93, 156, 81, 18, '#354b3829');
    round(c, 23, 96, 137, 52, 8, '#b09266'); round(c, 29, 117, 125, 32, 3, '#a4835c');
    round(c, 30, 139, 12, 27, 3, '#7c6348'); round(c, 142, 139, 12, 27, 3, '#7c6348');
    round(c, 18, 95, 150, 12, 4, '#dfc99b');
    round(c, 26, 41, 8, 64, 2, '#8f734e'); round(c, 150, 41, 8, 64, 2, '#8f734e');
    c.fillStyle = '#7e9472'; c.beginPath(); c.moveTo(9, 47); c.lineTo(39, 18); c.lineTo(150, 18); c.lineTo(178, 47); c.closePath(); c.fill();
    round(c, 9, 43, 169, 9, 3, '#647e61');
    round(c, 111, 102, 35, 36, 8, '#786f5b'); round(c, 118, 115, 20, 18, 6, '#504b3e');
    round(c, 43, 117, 42, 21, 4, '#d8c098');
    ellipse(c, 124, 91, 19, 8, '#495951'); round(c, 106, 78, 36, 15, 7, '#53665a'); ellipse(c, 124, 77, 19, 5, '#b1bb97'); ellipse(c, 124, 73, 4, 4, '#5b6e59');
    ellipse(c, 61, 91, 22, 7, '#846f50'); ellipse(c, 61, 87, 17, 6, '#ded0a4');
    round(c, 68, 57, 49, 16, 3, '#e8d7ad'); c.fillStyle = '#65724e'; c.font = '10px Georgia'; c.textAlign = 'center'; c.fillText('COZINHA', 92, 68);
  });
}
/** Small persistent sprites. Refresh only changed crop stages, never recreate the scene. */
export class FarmLayer {
  private plots = new Map<string, { soil: Phaser.GameObjects.Image; crop: Phaser.GameObjects.Image; badge: Phaser.GameObjects.Ellipse; key: string }>();
  private stationBadge: Phaser.GameObjects.Text;
  constructor(private scene: Phaser.Scene, onTap: (id: string, pointer: Phaser.Input.Pointer) => void) {
    createFarmTextures(scene);
    for (const plot of PLOTS) {
      const soil = scene.add.image(plot.x, plot.y, 'farm-soil-empty').setOrigin(.5, 75 / 110).setDepth(-.5);
      const crop = scene.add.image(plot.x, plot.y, 'farm-wheat-seed').setOrigin(.5, 75 / 110).setDepth(plot.y).setVisible(false);
      const badge = scene.add.ellipse(plot.x, plot.y + 4, 110, 55).setStrokeStyle(2, 0xf6e8a3, .8).setDepth(-.4).setVisible(false);
      const hit = scene.add.zone(plot.x, plot.y, 108, 80).setDepth(plot.y + 1).setInteractive();
      hit.on('pointerup', (pointer: Phaser.Input.Pointer) => { onTap(plot.id, pointer); });
      this.plots.set(plot.id, { soil, crop, badge, key: '' });
    }
    const station = STATIONS[0];
    const image = scene.add.image(station.x, station.y, 'farm-kitchen').setOrigin(.5, 156 / 178).setDepth(station.y).setInteractive();
    image.on('pointerup', (pointer: Phaser.Input.Pointer) => { onTap(station.id, pointer); });
    this.stationBadge = scene.add.text(station.x, station.y - 155, 'COZINHA', { fontFamily: '-apple-system,sans-serif', fontSize: '12px', color: '#526547', backgroundColor: '#f9efd5', padding: { x: 8, y: 5 } }).setOrigin(.5).setDepth(station.y + 1);
    scene.add.text(1012, 1670, 'HORTA DO JARDIM', { fontFamily: 'Georgia', fontSize: '13px', color: '#f4efd3', stroke: '#6b8050', strokeThickness: 3 }).setOrigin(.5).setDepth(1);
  }
  refresh(data: SaveData, now: number) {
    for (const plot of PLOTS) {
      const view = this.plots.get(plot.id)!;
      const crop = data.crops.find(c => c.plotId === plot.id);
      const stage = crop ? cropStage(crop, now) : '';
      const prepared = data.farm.plots[plot.id]?.prepared ?? false;
      const key = `${crop?.cropId ?? ''}:${stage}:${crop?.watered}:${prepared}`;
      if (view.key === key) continue;
      view.key = key;
      view.soil.setTexture(`farm-soil-${crop?.watered ? 'wet' : prepared ? 'prepared' : 'empty'}`);
      view.crop.setVisible(Boolean(crop)); view.badge.setVisible(stage === 'ready');
      if (crop) view.crop.setTexture(`farm-${crop.cropId}-${stage}`);
    }
    const job = data.production.find(job => job.stationId === STATIONS[0].id);
    const label = job ? now >= job.readyAt ? 'PRONTO  ✓' : 'PREPARANDO…' : 'COZINHA';
    if (this.stationBadge.text !== label) this.stationBadge.setText(label).setBackgroundColor(job && now >= job.readyAt ? '#f5df98' : '#f9efd5');
  }
  feedback(id: string, reduced: boolean) {
    const plot = this.plots.get(id);
    if (!plot || reduced) return;
    this.scene.tweens.killTweensOf(plot.crop);
    this.scene.tweens.add({ targets: plot.crop, scaleX: 1.07, scaleY: 1.07, duration: 120, yoyo: true });
  }
}
