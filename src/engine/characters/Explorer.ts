import Phaser from 'phaser';
import type { Position } from '../../domain/player/types';
type Direction='south'|'north'|'east'|'west';
const directions:Direction[]=['south','north','east','west'];
function createFrames(scene:Phaser.Scene){
 for(const direction of directions)for(let frame=0;frame<5;frame++){
  const key=`explorer-${direction}-${frame}`;if(scene.textures.exists(key))continue;
  const texture=scene.textures.createCanvas(key,96,126)!,c=texture.context;
  c.translate(48,116);if(direction==='west')c.scale(-1,1);
  const side=direction==='west'||direction==='east',back=direction==='north';
  const step=frame===0?0:Math.sin((frame-1)*Math.PI/2)*5;
  const ellipse=(x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const rect=(x:number,y:number,w:number,h:number,color:string,r=4)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  rect(-12,-24+step,10,22,'#64726c');rect(3,-24-step,10,22,'#79867a');rect(-13,-7+step,13,8,'#665347',3);rect(2,-7-step,14,8,'#665347',3);
  rect(-16,-58,32,35,'#e4d4b3',8);rect(-12,-55,25,32,'#748e78',4);
  rect(-22,-53-step*.5,8,24,'#dfc6a0',5);rect(15,-53+step*.5,8,24,'#d0ad87',5);
  ellipse(side?3:0,-71,12,15,'#d2ad88');ellipse(back?0:-3,-81,14,10,'#635447');
  if(back){ellipse(0,-70,13,13,'#675747');rect(-12,-51,25,29,'#ac8c60',6);rect(-9,-48,19,11,'#c8a677',3);}
  else {c.strokeStyle='#c5ab7f';c.lineWidth=4;c.beginPath();c.moveTo(10,-54);c.lineTo(-8,-29);c.stroke();rect(-17,-33,16,15,'#b39769',3);ellipse(side?12:5,-70,1.2,1.6,'#554e41');if(!side)ellipse(-4,-70,1.2,1.6,'#554e41');}
  ellipse(0,-84,28,7,'#b9965e');rect(-18,-101,35,19,'#d9bb7e',8);rect(-18,-87,35,5,'#91744f',1);ellipse(-5,-98,12,3,'#efda9d');
  texture.refresh();
 }
}
/** A replaceable appearance controller. Direction/locomotion stay independent of outfit art. */
export class Explorer {
 readonly root:Phaser.GameObjects.Container;
 private sprite:Phaser.GameObjects.Image;
 private direction:Direction='south';private key='';private travel=0;
 constructor(scene:Phaser.Scene,position:Position){
  createFrames(scene);const shadow=scene.add.ellipse(0,3,40,15,0x304f35,.22);
  this.sprite=scene.add.image(0,0,'explorer-south-0').setOrigin(.5,116/126);
  this.root=scene.add.container(position.x,position.y,[shadow,this.sprite]).setDepth(position.y);
 }
 get position(){return{x:this.root.x,y:this.root.y};}
 setPosition(p:Position){this.root.setPosition(p.x,p.y).setDepth(p.y);}
 animate(dx:number,dy:number,delta:number,time:number,reduced:boolean){
  const moving=Math.hypot(dx,dy)>.01;
  if(moving){this.direction=Math.abs(dx)>Math.abs(dy)?dx>0?'east':'west':dy>0?'south':'north';this.travel+=delta;}
  const frame=moving&&!reduced?1+Math.floor(this.travel/120)%4:0;
  const key=`explorer-${this.direction}-${frame}`;if(key!==this.key){this.sprite.setTexture(key);this.key=key;}
  this.sprite.y=reduced?0:moving?Math.sin(this.travel/65)*1.5:Math.sin(time/850)*1.1;
  this.root.setDepth(this.root.y);
 }
 destroy(){this.root.destroy(true);}
}
