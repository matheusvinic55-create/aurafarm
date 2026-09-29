import type Phaser from 'phaser';
import type { WorldDefinition } from '../../domain/maps/types';
/** Landscape framing with bounded follow. Future zoom/area transitions live here. */
export class WorldCamera{
 constructor(private camera:Phaser.Cameras.Scene2D.Camera,private world:WorldDefinition,private target:Phaser.GameObjects.Container){camera.setBounds(0,0,world.width,world.height);}
 resize(width:number,height:number){
  const desired=Math.min(1.08,Math.max(.6,height/650));
  const zoom=Math.max(desired,width/this.world.width,height/this.world.height);
  this.camera.setZoom(zoom).setDeadzone(width*.18,height*.12);
  this.camera.startFollow(this.target,false,.08,.08,0,70);
  this.camera.centerOn(this.target.x,this.target.y-70);
 }
 setReducedMotion(reduced:boolean){this.camera.setLerp(reduced?1:.08,reduced?1:.08);}
}
