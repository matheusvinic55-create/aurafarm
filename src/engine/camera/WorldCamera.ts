import Phaser from 'phaser';
import type { WorldDefinition } from '../../domain/maps/types';

/** The camera belongs to the player's gestures, never to character movement. */
export class WorldCamera {
  private userZoom = .8;
  private initialized = false;

  constructor(
    private camera: Phaser.Cameras.Scene2D.Camera,
    private world: WorldDefinition,
    private target: Phaser.GameObjects.Container
  ) {
    camera.stopFollow();
    camera.setBounds(0, 0, world.width, world.height);
  }

  resize(width: number, height: number) {
    const fit = Math.max(width / this.world.width, height / this.world.height);
    this.userZoom = Math.max(fit, Math.min(this.userZoom, 1.08));
    this.camera.setZoom(this.userZoom);
    // Frame the saved character once when opening the world. Walking never recenters it.
    if (!this.initialized) {
      this.camera.centerOn(this.target.x, this.target.y - 70);
      this.initialized = true;
    }
  }

  panByScreen(dx: number, dy: number) {
    this.camera.scrollX = this.camera.clampX(this.camera.scrollX - dx / this.camera.zoom);
    this.camera.scrollY = this.camera.clampY(this.camera.scrollY - dy / this.camera.zoom);
  }

  /** Pinch keeps the existing zoom range. Phaser clamps the viewport to world bounds. */
  zoomBy(factor: number) {
    const fit = Math.max(this.camera.width / this.world.width, this.camera.height / this.world.height);
    const next = Phaser.Math.Clamp(this.userZoom * factor, Math.max(.58, fit), 1.08);
    if (Math.abs(next - this.userZoom) < .001) return;
    this.userZoom = next;
    this.camera.setZoom(next);
  }
}
