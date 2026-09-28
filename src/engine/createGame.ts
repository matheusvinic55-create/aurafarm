import Phaser from 'phaser';
import { MeadowScene } from './scenes/MeadowScene';
export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO, parent, backgroundColor: '#e7ecd9',
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, roundPixels: false, powerPreference: 'low-power' },
    fps: { target: 60 }, input: { activePointers: 2, touch: { capture: true } },
    audio: { noAudio: true }, scene: [MeadowScene], banner: false
  });
}
