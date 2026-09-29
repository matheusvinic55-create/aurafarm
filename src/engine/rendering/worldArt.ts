import Phaser from 'phaser';
import type { SceneryKind } from '../../domain/maps/types';
import { MEADOW } from '../../domain/maps/meadow';
type C=CanvasRenderingContext2D;
const ellipse=(c:C,x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const polygon=(c:C,p:number[][],color:string)=>{c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const line=(c:C,p:number[][],color:string,width:number)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const random=(seed:number)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
export const ART:Record<SceneryKind,{w:number;h:number;foot:number}>={tree:{w:250,h:300,foot:270},goldTree:{w:250,h:300,foot:270},pine:{w:230,h:330,foot:300},rock:{w:140,h:130,foot:106},bush:{w:160,h:145,foot:115},flowers:{w:150,h:125,foot:100},cabin:{w:400,h:355,foot:320},sign:{w:155,h:160,foot:140},gate:{w:290,h:190,foot:157},bridge:{w:340,h:240,foot:170},bench:{w:185,h:140,foot:115},wood:{w:140,h:100,foot:75},npc:{w:120,h:180,foot:160}};
function foliage(c:C,gold=false,pine=false){
 const r=random(gold?52:43);ellipse(c,8,5,73,24,'#395a3928');
 const bark=c.createLinearGradient(-14,0,20,0);bark.addColorStop(0,'#786041');bark.addColorStop(.6,'#a08658');bark.addColorStop(1,'#67513d');
 polygon(c,[[-12,0],[-9,-135],[15,-139],[15,-6],[28,3],[7,8]],bark as unknown as string);
 line(c,[[0,-55],[-30,-102],[-43,-115]],'#84694b',9);line(c,[[3,-91],[30,-125]],'#8e7550',8);
 line(c,[[-5,-7],[-3,-65]],'#c0a476',3);
 if(pine){
  for(let i=0;i<4;i++){const y=-55-i*48,w=94-i*17;polygon(c,[[-w,y],[0,y-105],[w,y],[42,y+8],[10,y+2],[-30,y+10]],['#466f55','#507e5c','#638e64','#83a46e'][i]);polygon(c,[[-w,y],[0,y-105],[-9,y-12]],'#acc18b22');}
 }else{
  const colors=gold?['#9a9f51','#b4b15e','#c8c675','#dcd58b','#eeDEA0']:['#527849','#66894f','#7e9e5a','#97b366','#b1c57b'];
  ellipse(c,4,-130,96,82,colors[0]);
  [[-57,-139,58,55,1],[53,-151,57,61,2],[-19,-190,73,59,2],[31,-205,49,44,3],[-42,-193,49,38,3],[-11,-216,47,28,4]].forEach(([x,y,rx,ry,i])=>ellipse(c,x,y,rx,ry,colors[i]));
  for(let i=0;i<70;i++){const x=(r()-.5)*162,y=-220+r()*120;if((x/92)**2+((y+168)/75)**2<1)ellipse(c,x,y,3+r()*8,2+r()*4,colors[2+Math.floor(r()*3)]+'66');}
  line(c,[[-65,-157],[-43,-169],[-30,-169]],'#d6dda33a',4);
 }
}
function cabin(c:C){
 ellipse(c,15,7,158,45,'#36593a30');
 polygon(c,[[-120,-130],[10,-89],[10,5],[-120,-36]],'#f1ddb1');
 polygon(c,[[10,-89],[127,-126],[127,-32],[10,5]],'#cfbe91');
 polygon(c,[[-120,-130],[-58,-213],[10,-89]],'#f3e5c6');
 polygon(c,[[-65,-224],[52,-260],[145,-128],[10,-85]],'#b67850');
 polygon(c,[[-65,-224],[10,-85],[-3,-79],[-63,-189],[-127,-119],[-141,-130]],'#d1a077');
 for(let i=0;i<6;i++)line(c,[[-51+i*10,-207+i*19],[65+i*11,-243+i*19]],'#e6b17c77',3);
 for(let i=0;i<4;i++)line(c,[[-112,-96+i*22],[4,-60+i*22]],'#c4b59344',1.5);
 polygon(c,[[-95,-90],[-56,-78],[-56,-16],[-95,-28]],'#667e69');
 polygon(c,[[-88,-85],[-64,-78],[-64,-46],[-88,-53]],'#a9c5aa');ellipse(c,-65,-39,2.5,3,'#e7d492');
 polygon(c,[[44,-83],[85,-96],[85,-53],[44,-40]],'#668d85');
 line(c,[[65,-89],[65,-47]],'#f0e0b8',4);line(c,[[45,-62],[83,-73]],'#f0e0b8',4);
 polygon(c,[[37,-38],[89,-54],[89,-44],[37,-28]],'#9b7853');
 for(let i=0;i<8;i++){ellipse(c,44+i*5,-41-i*1.5,7,8,'#6f9655');ellipse(c,44+i*5,-48-i*1.5,3.8,4,['#e8bba3','#f4dbaf','#be9aa5'][i%3]);}
 polygon(c,[[-108,-27],[-45,-7],[-35,7],[-110,-15]],'#b8a885');
 polygon(c,[[88,-204],[108,-210],[108,-259],[88,-253]],'#bead8c');polygon(c,[[84,-260],[105,-268],[115,-262],[94,-254]],'#dbccb0');
 ellipse(c,-130,-14,18,8,'#947450');polygon(c,[[-146,-40],[-112,-40],[-118,-13],[-139,-13]],'#b38d66');ellipse(c,-130,-44,29,21,'#779755');ellipse(c,-138,-53,8,8,'#d2c579');
}
function drawObject(c:C,kind:SceneryKind){
 if(kind==='tree'||kind==='goldTree'||kind==='pine'){foliage(c,kind==='goldTree',kind==='pine');return;}
 if(kind==='cabin'){cabin(c);return;} if(kind==='npc'){ellipse(c,0,4,30,10,'#40593b2b');ellipse(c,0,-116,23,25,'#d8ae86');ellipse(c,-7,-121,18,18,'#604a3e');ellipse(c,0,-70,32,48,'#8fa273');polygon(c,[[-28,-89],[28,-89],[22,-27],[-22,-27]],'#91a878');line(c,[[-15,-29],[-18,0]],'#665b4d',8);line(c,[[15,-29],[18,0]],'#665b4d',8);ellipse(c,-8,-118,2,2,'#4d443c');ellipse(c,8,-118,2,2,'#4d443c');return;}
 ellipse(c,4,5,kind==='bridge'?138:kind==='gate'?113:50,kind==='bridge'?32:17,'#45633c26');
 if(kind==='rock'){
  polygon(c,[[-46,-6],[-40,-41],[-9,-63],[25,-59],[50,-28],[42,3],[7,10]],'#8e9d87');polygon(c,[[-40,-41],[-9,-63],[25,-59],[13,-30],[-14,-24]],'#c3c7ac');polygon(c,[[13,-30],[25,-59],[50,-28],[42,3],[8,7]],'#a5b099');line(c,[[-36,-13],[-18,-8]],'#72865c',5);ellipse(c,25,-5,14,5,'#839657');
 }else if(kind==='bush'){
  ellipse(c,0,-25,55,35,'#567e49');ellipse(c,-27,-42,33,29,'#709851');ellipse(c,26,-47,36,31,'#84a55b');ellipse(c,-2,-56,30,28,'#96b368');
  [[-28,-46],[15,-36],[38,-47],[-6,-63],[6,-17]].forEach(([x,y])=>{ellipse(c,x,y,6,7,'#866071');ellipse(c,x-2,y-2,2,2,'#d8a4af');});
 }else if(kind==='flowers'){
  for(let i=0;i<12;i++){const x=(i%5)*21-44,y=Math.floor(i/5)*-16-6;line(c,[[x,y],[x+3,y-25]],'#799349',2.5);ellipse(c,x+8,y-11,8,4,'#8fa761');for(let a=0;a<5;a++)ellipse(c,x+3+Math.cos(a*1.26)*6,y-28+Math.sin(a*1.26)*5,4,4,['#f4e7b1','#bfabc1','#e6b197'][i%3]);ellipse(c,x+3,y-28,3,3,'#c6a456');}
 }else if(kind==='wood'){
  line(c,[[-41,-10],[38,-38]],'#806449',17);line(c,[[-38,-16],[38,-42]],'#ad8b5d',6);line(c,[[-24,-39],[29,0]],'#8f724d',11);line(c,[[7,-29],[7,-56]],'#8f724d',5);ellipse(c,-40,-9,7,9,'#d4b786');
 }else if(kind==='sign'){
  line(c,[[0,0],[0,-85]],'#97764f',11);polygon(c,[[-52,-104],[44,-104],[57,-82],[44,-59],[-52,-59]],'#caa575');line(c,[[-46,-97],[42,-97]],'#edd4a0',3);line(c,[[-22,-79],[27,-79]],'#796746',4);line(c,[[16,-88],[28,-79],[16,-70]],'#796746',4);ellipse(c,-18,-73,4,4,'#efe1ae');
 }else if(kind==='bench'){
  line(c,[[-51,-34],[-51,1]],'#79664f',7);line(c,[[51,-22],[51,8]],'#79664f',7);polygon(c,[[-65,-36],[50,-60],[68,-36],[-45,-12]],'#b89b6f');line(c,[[-54,-47],[-56,-86]],'#7b6b50',6);line(c,[[55,-48],[56,-96]],'#7b6b50',6);polygon(c,[[-68,-85],[66,-105],[66,-76],[-68,-56]],'#c6ab80');line(c,[[-60,-68],[59,-87]],'#907c58',2);
 }else if(kind==='gate'){
  for(const x of [-110,110]){line(c,[[x,0],[x,-117]],'#a38a62',17);ellipse(c,x,-118,10,6,'#d7c18b');}
  polygon(c,[[-99,-88],[99,-98],[99,-23],[-99,-13]],'#ac9770');line(c,[[-95,-84],[95,-25]],'#d6c390',9);line(c,[[-95,-20],[95,-94]],'#c7b483',9);
  for(let i=0;i<14;i++){const x=-125+i*19;ellipse(c,x,-8-Math.sin(i)*13,23,17,i%2?'#719653':'#8ca95c');if(i%3===0)ellipse(c,x,-42,15,28,'#91ad62');}
 }else if(kind==='bridge'){
  polygon(c,[[-156,-38],[147,-84],[161,-5],[-144,44]],'#6c9d9733');
  for(let i=0;i<13;i++){if(i===6||i===7)continue;const x=-147+i*24;polygon(c,[[x,-42-i*3],[x+20,-45-i*3],[x+27,30-i*3],[x+6,33-i*3]],i%2?'#bca277':'#cbb58c');line(c,[[x+5,-35-i*3],[x+19,23-i*3]],'#e3cc9a44',2);}
  for(const x of [-139,-74,73,141])line(c,[[x,-40],[x,-101]],'#99815e',8);
  line(c,[[-139,-91],[-74,-101]],'#c8b288',6);line(c,[[73,-115],[141,-127]],'#c8b288',6);
 }
}
export function createWorldTextures(scene:Phaser.Scene){
 for(const kind of Object.keys(ART)as SceneryKind[]){const key=`world-${kind}`;if(scene.textures.exists(key))continue;const spec=ART[kind],texture=scene.textures.createCanvas(key,spec.w,spec.h)!;const c=texture.context;c.translate(spec.w/2,spec.foot);drawObject(c,kind);texture.refresh();}
 if(!scene.textures.exists('meadow-grass')){const t=scene.textures.createCanvas('meadow-grass',256,256)!,c=t.context,r=random(3);c.fillStyle='#9fbb79';c.fillRect(0,0,256,256);for(let i=0;i<480;i++){const x=r()*256,y=r()*256;c.fillStyle=i%3?'#c3d39535':'#789e6030';c.fillRect(x,y,1+r()*3,1+r()*2);}t.refresh();}
}
export function drawWorldGround(scene:Phaser.Scene){
 scene.add.tileSprite(0,0,MEADOW.width,MEADOW.height,'meadow-grass').setOrigin(0).setDepth(-2000);
 const g=scene.add.graphics().setDepth(-1900);
 g.fillStyle(0x7e9d61,.3).fillEllipse(1210,1230,2090,2230);g.fillStyle(0xb8cd88,.55).fillEllipse(1160,1330,1550,1750);g.fillStyle(0xc7d898,.28).fillEllipse(1080,1410,1180,1450);
 const randomValue=random(12);
 for(let i=0;i<180;i++){const x=500+randomValue()*1350,y=550+randomValue()*1540;g.fillStyle(i%2?0x7c9e5b:0xd3dea3,.10).fillEllipse(x,y,25+randomValue()*80,10+randomValue()*26);}
 // A stream traverses the eastern forest and leads to the future crossing.
 const stream=new Phaser.Curves.Spline([2120,0,1990,570,2060,1040,1990,1340,2100,1890,2290,2400]).getPoints(90);
 g.lineStyle(148,0x738f64,.6).strokePoints(stream);g.lineStyle(130,0xcec99d).strokePoints(stream);g.lineStyle(108,0x649e99).strokePoints(stream);g.lineStyle(84,0x86bbb1).strokePoints(stream);g.lineStyle(40,0xa4cfc0,.45).strokePoints(stream);
 for(const path of MEADOW.paths){const points=new Phaser.Curves.Spline(path.map(p=>new Phaser.Math.Vector2(p.x,p.y))).getPoints(55);g.lineStyle(82,0x96a369,.3).strokePoints(points);g.lineStyle(68,0xc8b988).strokePoints(points);g.lineStyle(54,0xdccda0).strokePoints(points);g.lineStyle(20,0xe7d8ad,.35).strokePoints(points);}
 g.fillStyle(0x879765,.8).fillEllipse(1595,1639,335,456);g.fillStyle(0xd6cea0).fillEllipse(1595,1632,313,432);g.fillStyle(0x5e9d98).fillEllipse(1595,1630,286,412);g.fillStyle(0x80b9ad).fillEllipse(1583,1614,252,368);g.fillStyle(0xa4d0bb,.45).fillEllipse(1567,1570,192,234);
 g.lineStyle(3,0xd8ebcd,.65);for(let i=0;i<7;i++){const x=1510+(i%3)*47,y=1510+i*37;g.lineBetween(x,y,x+27+i%3*10,y);}
 for(let i=0;i<7;i++){const a=i*1.2,x=1595+Math.cos(a)*137,y=1635+Math.sin(a)*199;g.fillStyle(0x638d56).fillEllipse(x,y,29,16);g.fillStyle(0xe4dba4).fillCircle(x+3,y-4,3);}
 // Fences use the same footprint coordinates as the navigation definition.
 for(const [x,width]of [[687,110],[1070,170]]){g.lineStyle(9,0x9b8860).lineBetween(x,1250,x+width,1250);g.lineStyle(7,0xc9b78a).lineBetween(x,1228,x+width,1228);for(let px=x;px<=x+width;px+=36){g.lineStyle(10,0xb29e73).lineBetween(px,1281,px,1212);g.fillStyle(0xe0cda0).fillEllipse(px,1212,11,5);}}
 // Small stones and grasses blend the path into the meadow.
 for(const path of MEADOW.paths){for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let j=0;j<8;j++){const t=randomValue(),x=a.x+(b.x-a.x)*t+(randomValue()-.5)*60,y=a.y+(b.y-a.y)*t+(randomValue()-.5)*50;g.fillStyle(0xb4aa7c,.45).fillEllipse(x,y,3+randomValue()*8,2+randomValue()*3);}}}
 for(let i=0;i<150;i++){const x=550+randomValue()*1250,y=650+randomValue()*1370;if(((x-1595)/175)**2+((y-1635)/235)**2<1)continue;g.lineStyle(2,0x789654,.6).lineBetween(x,y,x-3,y-8).lineBetween(x,y,x+4,y-6);if(i%4===0)g.fillStyle(i%8?0xf4e2a9:0xb9a6c0).fillCircle(x,y-9,2);}
 return g;
}
