import Phaser from 'phaser';
import type { Position } from '../../domain/player/types';
import type { InteractionFeedback } from '../../domain/exploration/types';
import { RESOURCES, type ResourceId } from '../../domain/resources/catalog';
/** Bounded, short-lived effects. Rewards are already committed before these run. */
export class ExplorationEffects {
  constructor(private scene: Phaser.Scene) {}
  play(event: InteractionFeedback, position: Position, image: Phaser.GameObjects.Image | undefined, reduced: boolean) {
    if (image) {
      this.scene.tweens.killTweensOf(image);
      if (event.removed) {
        if (reduced) image.setVisible(false);
        else this.scene.tweens.add({ targets: image, alpha: 0, scaleX: image.scaleX * .85, scaleY: image.scaleY * .85, duration: 320, onComplete: () => image.setVisible(false) });
      } else if (!reduced) this.scene.tweens.add({ targets: image, angle: 5, duration: 65, yoyo: true, repeat: 1, onComplete: () => image.setAngle(0) });
    }
    if (!reduced) for (let i = 0; i < 7; i++) {
      const dot = this.scene.add.circle(position.x, position.y-20, 3+i%2, i%2 ? 0xe9dba4 : 0xa3be72).setDepth(4000);
      this.scene.tweens.add({ targets: dot, x: position.x+Math.cos(i*2.4)*50, y: position.y-40-Math.sin(i*2.4)*30, alpha: 0, duration: 500, onComplete: () => dot.destroy() });
    }
    const text = Object.entries(event.rewards).map(([id, count]) => `+${count} ${RESOURCES[id as ResourceId].plural}`).join(' · ');
    const energy = event.energy ? `${event.energy>0?'+':''}${event.energy} energia` : '';
    const label = this.scene.add.text(position.x, position.y-95, [text, energy].filter(Boolean).join('\n'), {
      fontFamily: '-apple-system, sans-serif', fontSize: '17px', color: '#fff9dc', stroke: '#405b38', strokeThickness: 4, align: 'center'
    }).setOrigin(.5).setDepth(5000);
    this.scene.tweens.add({ targets: label, y: label.y-(reduced?0:35), alpha: 0, delay: 650, duration: 650, onComplete: () => label.destroy() });
  }
}
