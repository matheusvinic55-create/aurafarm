import type Phaser from 'phaser';
import type { WorldDefinition } from '../../domain/maps/types';

/** Landscape camera with bounded follow, one-finger panning and pinch zoom. */
export class WorldCamera {
  private reduced = false;
  private userZoom = .8;
  private freePan = false;

  constructor(
    private camera: Phaser.Cameras.Scene2D.Camera,
    private world: WorldDefinition,
    private target: Phaser.GameObjects.Container
  ) {
    camera.setBounds(0, 0, world.width, world.height);
  }

  resize(width: number, height: number) {
    const fit = Math.max(width / this.world.width, height / this.world.height);
    this.userZoom = Math.max(fit, Math.min(this.userZoom, 1.05));
    this.camera.setZoom(this.userZoom).setDeadzone(width * .18, height * .12);
    if (!this.freePan) this.follow();
  }

  /** Dragging the scenery moves the camera in the opposite direction to the finger. */
  panByScreen(dx: number, dy: number) {
    if (!this.freePan) {
      this.camera.stopFollow();
      this.freePan = true;
    }
    this.camera.scrollX -= dx / this.camera.zoom;
    this.camera.scrollY -= dy / this.camera.zoom;
    this.clamp();
  }

  /** Pinch zoom, preserving a useful world-scale range on iPhone. */
  zoomBy(factor: number) {
    const fit = Math.max(this.camera.width / this.world.width, this.camera.height / this.world.height);
    const next = Phaser.Math.Clamp(this.userZoom * factor, Math.max(.58, fit), 1.08);
    if (Math.abs(next - this.userZoom) < .001) return;
    this.userZoom = next;
    if (!this.freePan) {
      this.camera.stopFollow();
      this.freePan = true;
    }
    this.camera.setZoom(next);
    this.clamp();
  }

  /** A deliberate ground tap returns the camera to the explorer while they walk. */
  resumeFollow() {
    this.freePan = false;
    this.follow();
  }

  private follow() {
    this.camera.startFollow(this.target, false, this.reduced ? 1 : .08, this.reduced ? 1 : .08, 0, 70);
  }

  private clamp() {
    const viewW = this.camera.width / this.camera.zoom;
    const viewH = this.camera.height / this.camera.zoom;
    const maxX = Math.max(0, this.world.width - viewW);
    const maxY = Math.max(0, this.world.height - viewH);
    this.camera.scrollX = Phaser.Math.Clamp(this.camera.scrollX, 0, maxX);
    this.camera.scrollY = Phaser.Math.Clamp(this.camera.scrollY, 0, maxY);
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
    this.camera.setLerp(reduced ? 1 : .08, reduced ? 1 : .08);
  }
}
