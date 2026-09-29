import type { SceneryObject, WorldDefinition } from './types';
const WORLD_SCALE = 1.28;
const WORLD_CENTER = 1200;
const spread = (value:number) => WORLD_CENTER + (value - WORLD_CENTER) * WORLD_SCALE;
const point=(x:number,y:number)=>({x:spread(x),y:spread(y)});
const objects:SceneryObject[]=[
{id:'home',kind:'cabin',x:900,y:1210,scale:1,solid:{type:'rect',x:780,y:1075,width:234,height:132},interaction:{name:'Casa do Ipê',description:'Madeira antiga, janelas abertas e espaço para um novo começo.',approach:point(960,1300)}},
{id:'welcome-sign',kind:'sign',x:1180,y:1580,scale:1,solid:{type:'ellipse',x:1180,y:1580,radiusX:23,radiusY:14},interaction:{name:'Clareira do Amanhecer',description:'A casa fica a oeste. O lago, a leste. Vá pelo caminho que chamar você.',approach:point(1224,1644)}},
{id:'old-gate',kind:'gate',x:1170,y:620,scale:1,solid:{type:'rect',x:1060,y:540,width:220,height:100},interaction:{name:'Trilha das Samambaias',description:'A vegetação abraçou o portão. Há mais mundo do outro lado, para uma próxima aventura.',approach:point(1176,720),future:true}},
{id:'broken-bridge',kind:'bridge',x:1960,y:1270,scale:1,solid:{type:'rect',x:1850,y:1170,width:285,height:165},interaction:{name:'Ponte do Riacho',description:'Faltam algumas tábuas. Este caminho ainda guarda outra aventura.',approach:point(1776,1308),future:true}},
{id:'pond-bench',kind:'bench',x:1390,y:1670,scale:1,solid:{type:'rect',x:1334,y:1632,width:112,height:43},interaction:{name:'Um lugar para respirar',description:'O vento passa pelas folhas. A clareira não tem pressa.',approach:point(1380,1752)}},
{id:'meadow-berries',kind:'bush',x:1430,y:1170,scale:1,solid:{type:'ellipse',x:1430,y:1170,radiusX:38,radiusY:24},interaction:{name:'Amoreira',description:'Frutos pequenos entre as folhas. Um achado para as próximas aventuras.',approach:point(1452,1248)}},
{id:'meadow-flowers',kind:'flowers',x:805,y:1570,scale:1.25,interaction:{name:'Flores do campo',description:'Pétalas de creme, lavanda e cor de sol entre o verde.',approach:point(864,1608)}},
{id:'meadow-branches',kind:'wood',x:1050,y:1720,scale:1,solid:{type:'ellipse',x:1050,y:1720,radiusX:44,radiusY:22},interaction:{name:'Galhos da última chuva',description:'A natureza deixa pequenos achados pelo caminho. Hoje, basta explorar.',approach:point(1116,1740)}},
{id:'river-stone',kind:'rock',x:1680,y:1090,scale:1.3,solid:{type:'ellipse',x:1680,y:1090,radiusX:47,radiusY:35},interaction:{name:'Pedra do Riacho',description:'Uma pedra lisa, marcada por muitas estações de chuva.',approach:point(1644,1176)}}
];
[[704,1370,1.15,0],[1270,1040,1.2,2],[1430,820,1.1,0],[896,826,1,1],[710,1720,1,0],[1310,1900,1.2,2],[1690,1830,.95,0],[1740,955,1,1],[630,1130,.95,0],[1570,1390,.9,0],[1090,875,.95,1],[960,1900,1.05,0],[1460,1970,1,1],[1550,685,1,0]].forEach(([x,y,scale,v],i)=>objects.push({id:`tree-${i}`,kind:v===1?'pine':v===2?'goldTree':'tree',x,y,scale,solid:{type:'ellipse',x,y,radiusX:26*scale,radiusY:21*scale},interaction:{name:v===2?'Ipê da Clareira':v===1?'Pinheiro do Campo':'Árvore da Clareira',description:v===2?'Folhas douradas e sombra tranquila. Um encontro de luz no meio do verde.':'Uma copa cheia de vida. O caminho segue ao redor do tronco.',approach:point(x+75,y+65)}}));
[[610,1490,.8],[1000,690,.7],[1580,910,.9],[1760,1640,1],[930,1770,.55],[1480,1470,.65]].forEach(([x,y,scale],i)=>objects.push({id:`stone-${i}`,kind:'rock',x,y,scale,solid:{type:'ellipse',x,y,radiusX:36*scale,radiusY:27*scale},interaction:{name:'Pedra do campo',description:'O caminho faz uma pequena curva por aqui.',approach:point(x+65,y+60)}}));
// A finite forest buffer fills the camera bounds, outside the walkable polygon.
for(let i=0;i<110;i++){const a=i*2.399963,r=920+(i%4)*85;objects.push({id:`forest-${i}`,kind:i%4===0?'pine':i%9===0?'goldTree':'tree',x:1200+Math.cos(a)*r,y:1210+Math.sin(a)*r*.98,scale:1.1+(i%5)*.12});}
[[680,990],[770,1840],[1350,730],[1750,1470],[1530,1890],[970,1430],[1290,1340],[650,1540]].forEach(([x,y],i)=>objects.push({id:`flowers-${i}`,kind:'flowers',x,y,scale:.7+(i%3)*.15}));
[[680,1200],[1540,770],[830,1870],[1770,1520],[880,650],[1280,610],[1040,600]].forEach(([x,y],i)=>objects.push({id:`shrub-${i}`,kind:'bush',x,y,scale:1,solid:{type:'ellipse',x,y,radiusX:35,radiusY:24}}));
// Stable instance IDs survive map edits and save migrations.
const removables:Record<string,SceneryObject['obstacleType']>={
 'meadow-branches':'branches','river-stone':'boulder',
 'stone-0':'pebble','stone-1':'pebble','stone-2':'boulder','stone-3':'boulder','stone-4':'pebble','stone-5':'pebble',
 'shrub-0':'shrub','shrub-1':'shrub','shrub-2':'shrub','shrub-3':'shrub'
};
for(const object of objects){
 const type=removables[object.id];if(!type)continue;object.obstacleType=type;
 object.interaction??={name:'Arbusto fechado',description:'Folhas e pequenos recursos pelo caminho.',approach:point(object.x+65,object.y+70)};
}
objects.push(
 {id:'trail-branches',kind:'wood',x:1180,y:890,scale:1.2,obstacleType:'branches',solid:{type:'ellipse',x:1180,y:890,radiusX:65,radiusY:25},interaction:{name:'Galhos da trilha',description:'O primeiro passo para reencontrar a trilha.',approach:point(1200,970)}},
 {id:'trail-log',kind:'wood',x:1190,y:770,scale:1.8,obstacleType:'log',solid:{type:'ellipse',x:1190,y:770,radiusX:85,radiusY:34},interaction:{name:'Tronco da trilha',description:'Duas ações leves para desimpedir este trecho.',approach:point(1200,845)}},
 {id:'trail-thicket',kind:'bush',x:1170,y:670,scale:1.6,obstacleType:'thicket',solid:{type:'ellipse',x:1170,y:670,radiusX:80,radiusY:34},interaction:{name:'Samambaias do portão',description:'A última vegetação que segura o velho portão.',approach:point(1176,738)}},
 {id:'fern-bench',kind:'bench',x:1250,y:340,scale:1,areaId:'fern-grove',solid:{type:'rect',x:1194,y:305,width:112,height:43},interaction:{name:'Recanto das Samambaias',description:'Um banco ao sol e um novo horizonte. Este lugar agora também é seu.',approach:point(1260,420)}},
 {id:'fern-log',kind:'wood',x:1060,y:410,scale:1.3,areaId:'fern-grove',obstacleType:'log',solid:{type:'ellipse',x:1060,y:410,radiusX:58,radiusY:25},interaction:{name:'Tronco do recanto',description:'Madeira que o vento deixou entre as flores.',approach:point(1120,475)}},
 {id:'fern-stone',kind:'rock',x:1330,y:480,scale:.7,areaId:'fern-grove',obstacleType:'pebble',solid:{type:'ellipse',x:1330,y:480,radiusX:26,radiusY:19},interaction:{name:'Pedra coberta de musgo',description:'Mais um pequeno espaço para abrir.',approach:point(1272,540)}},
 {id:'fern-flowers',kind:'flowers',x:1130,y:315,scale:1.2,areaId:'fern-grove',interaction:{name:'Flores do recanto',description:'O perfume de um lugar que estava esperando por você.',approach:point(1128,384)}},
 {id:'fern-future',kind:'sign',x:1160,y:220,scale:.8,areaId:'fern-grove',interaction:{name:'Além da colina',description:'A trilha continua entre as copas. Outra descoberta para o futuro.',approach:point(1160,290),future:true}},
 {id:'fern-gold-tree',kind:'goldTree',x:1380,y:300,scale:1.05,areaId:'fern-grove',solid:{type:'ellipse',x:1380,y:300,radiusX:29,radiusY:23}},
 {id:'fern-pine',kind:'pine',x:955,y:330,scale:.9,areaId:'fern-grove',solid:{type:'ellipse',x:955,y:330,radiusX:24,radiusY:20}}
);
// Keep the entrance legible instead of covering the new clearing with decorative forest.
for(let i=objects.length-1;i>=0;i--)if(objects[i].id.startsWith('forest-')&&objects[i].x>920&&objects[i].x<1450&&objects[i].y<670)objects.splice(i,1);
const gate=objects.find(o=>o.id==='old-gate')!;
gate.interaction!.description='Limpe os galhos, o tronco e as samambaias da trilha para abrir este caminho.';
// Give the existing world more breathing room while preserving every stable object ID and gameplay system.
for (const object of objects) {
  object.x = spread(object.x);
  object.y = spread(object.y);
  if (object.solid) {
    object.solid.x = spread(object.solid.x);
    object.solid.y = spread(object.solid.y);
  }
}
export const TRAIL_BLOCKERS=['trail-branches','trail-log','trail-thicket'];
export const MEADOW:WorldDefinition={id:'first-meadow',revision:5,name:'Clareira do Amanhecer',width:3072,height:3072,spawn:point(1128,1368),boundary:[[520,960],[680,710],[970,480],[940,200],[1390,200],[1420,510],[1670,720],[1760,1060],[1960,1170],[1930,1450],[1800,1650],[1710,1930],[1370,2090],[930,2000],[630,1770],[510,1390]].map(([x,y])=>point(x,y)),blockedAreas:[{id:'country-kitchen',type:'rect',x:825,y:1318,width:100,height:42},{type:'ellipse',x:1595,y:1635,radiusX:143,radiusY:206},{id:'fern-entrance',type:'rect',x:970,y:460,width:420,height:175},{type:'rect',x:1840,y:1130,width:400,height:240},{type:'rect',x:687,y:1274,width:110,height:14},{type:'rect',x:1070,y:1274,width:170,height:14}],objects,paths:[[[1170,590],[1140,500],[1170,400],[1160,270]],[[1190,2030],[1190,1830],[1170,1620],[1120,1450],[1050,1320],[930,1230]],[[1120,1450],[1180,1240],[1180,970],[1150,790],[1170,590]],[[1180,1240],[1430,1330],[1640,1320],[1910,1270]],[[1170,1620],[1310,1740],[1430,1810],[1540,1890]],[[1050,1320],[850,1400],[800,1580],[950,1780],[1190,1830]]].map(path=>path.map(([x,y])=>point(x,y))),zones:[{name:'Recanto das Samambaias',bounds:{type:'rect',x:900,y:150,width:550,height:490}},{name:'Trilha das Samambaias',bounds:{type:'rect',x:600,y:350,width:1200,height:570}},{name:'Margem do Riacho',bounds:{type:'rect',x:1550,y:900,width:600,height:540}},{name:'Lago das Libélulas',bounds:{type:'rect',x:1300,y:1450,width:600,height:620}},{name:'Jardim da Casa',bounds:{type:'rect',x:540,y:930,width:510,height:550}}]};
// The world definition still contains authored rectangles/ellipses in the original coordinate space.
for (const area of MEADOW.blockedAreas) {
  area.x = spread(area.x); area.y = spread(area.y);
  if (area.type === 'rect') { area.width *= WORLD_SCALE; area.height *= WORLD_SCALE; }
  else { area.radiusX *= WORLD_SCALE; area.radiusY *= WORLD_SCALE; }
}
for (const zone of MEADOW.zones) {
  zone.bounds.x = spread(zone.bounds.x); zone.bounds.y = spread(zone.bounds.y);
  zone.bounds.width *= WORLD_SCALE; zone.bounds.height *= WORLD_SCALE;
}
export const WORLD_OBJECTS=objects.filter(object=>object.interaction);
export const findWorldObject=(id:string)=>objects.find(object=>object.id===id);
export interface MapProgress{unlockedAreas:string[];visitedPlaces:string[]}
