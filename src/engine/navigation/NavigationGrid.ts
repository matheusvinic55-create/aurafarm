import type { Position } from '../../domain/player/types';
import type { CollisionShape, WorldDefinition } from '../../domain/maps/types';
export function contains(s:CollisionShape,p:Position,m=0):boolean{return s.type==='rect'?p.x>=s.x-m&&p.x<=s.x+s.width+m&&p.y>=s.y-m&&p.y<=s.y+s.height+m:((p.x-s.x)/(s.radiusX+m))**2+((p.y-s.y)/(s.radiusY+m))**2<=1;}
function inPolygon(p:Position,poly:Position[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
class MinHeap{
 private items:{id:number;score:number}[]=[];
 get size(){return this.items.length;}
 push(id:number,score:number){const item={id,score};let i=this.items.length;this.items.push(item);while(i>0){const p=(i-1)>>1;if(this.items[p].score<=score)break;this.items[i]=this.items[p];i=p;}this.items[i]=item;}
 pop(){const first=this.items[0],last=this.items.pop()!;if(this.items.length){let i=0;while(true){let c=i*2+1;if(c>=this.items.length)break;if(c+1<this.items.length&&this.items[c+1].score<this.items[c].score)c++;if(this.items[c].score>=last.score)break;this.items[i]=this.items[c];i=c;}this.items[i]=last;}return first.id;}
}
/** Pure world-space navigation. No rendering, storage, object IDs or React. */
export class NavigationGrid{
 readonly cellSize=24;readonly radius=20;readonly cols:number;readonly rows:number;
 private cells:Uint8Array;private reachable:Uint8Array;private solids:CollisionShape[];
 private offsets=Array.from({length:8},(_,i)=>({x:Math.cos(i*Math.PI/4)*20,y:Math.sin(i*Math.PI/4)*20}));
 constructor(readonly world:WorldDefinition){
  this.cols=Math.ceil(world.width/24);this.rows=Math.ceil(world.height/24);this.solids=[...world.blockedAreas,...world.objects.flatMap(o=>o.solid?[o.solid]:[])];this.cells=new Uint8Array(this.cols*this.rows);this.reachable=new Uint8Array(this.cells.length);
  for(let i=0;i<this.cells.length;i++)this.cells[i]=this.isWalkable(this.center(i))?1:0;
  const seed=this.closestCell(world.spawn,false);if(seed<0)throw new Error('No safe map spawn');const queue=[seed];this.reachable[seed]=1;
  for(let cursor=0;cursor<queue.length;cursor++){const id=queue[cursor],x=id%this.cols,y=Math.floor(id/this.cols);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*this.cols+nx;if(nx>=0&&nx<this.cols&&ny>=0&&ny<this.rows&&this.cells[n]&&!this.reachable[n]&&this.segmentClear(this.center(id),this.center(n))){this.reachable[n]=1;queue.push(n);}}}
 }
 center(id:number):Position{return{x:(id%this.cols+.5)*24,y:(Math.floor(id/this.cols)+.5)*24};}
 isWalkable(p:Position){if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!inPolygon(p,this.world.boundary))return false;for(const o of this.offsets)if(!inPolygon({x:p.x+o.x,y:p.y+o.y},this.world.boundary))return false;return !this.solids.some(s=>contains(s,p,this.radius));}
 segmentClear(a:Position,b:Position){const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/6));for(let i=0;i<=steps;i++)if(!this.isWalkable({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps}))return false;return true;}
 private closestCell(p:Position,connected=true,limit=Infinity){let best=-1,distance=limit*limit;for(let i=0;i<this.cells.length;i++){if(!this.cells[i]||(connected&&!this.reachable[i]))continue;const c=this.center(i),d=(c.x-p.x)**2+(c.y-p.y)**2;if(d<distance){best=i;distance=d;}}return best;}
 private visibleCell(p:Position){const cx=Math.floor(p.x/24),cy=Math.floor(p.y/24);let best=-1,dist=Infinity;for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++){if(x<0||y<0||x>=this.cols||y>=this.rows)continue;const id=y*this.cols+x;if(!this.reachable[id])continue;const c=this.center(id),d=(c.x-p.x)**2+(c.y-p.y)**2;if(d<dist&&this.segmentClear(p,c)){best=id;dist=d;}}return best;}
 safePosition(p:Position):Position{if(this.isWalkable(p)&&this.visibleCell(p)>=0)return{...p};if(Number.isFinite(p.x)&&Number.isFinite(p.y)){const n=this.closestCell(p,true,150);if(n>=0)return this.center(n);}return this.center(this.closestCell(this.world.spawn));}
 findPath(from:Position,to:Position):Position[]|null{
  if(!this.isWalkable(from)||!this.isWalkable(to))return null;const start=this.visibleCell(from),goal=this.visibleCell(to);if(start<0||goal<0)return null;if(this.segmentClear(from,to))return[{...to}];
  const heap=new MinHeap(),costs=new Float64Array(this.cells.length).fill(Infinity),parents=new Int32Array(this.cells.length).fill(-1),closed=new Uint8Array(this.cells.length),target=this.center(goal);costs[start]=0;heap.push(start,0);
  while(heap.size){const id=heap.pop();if(closed[id])continue;if(id===goal){const route:Position[]=[{...to}];let cursor=goal;while(cursor!==-1){route.push(this.center(cursor));cursor=parents[cursor];}route.push({...from});route.reverse();const smooth:Position[]=[];let anchor=0;while(anchor<route.length-1){let far=anchor+1;for(let next=far+1;next<route.length;next++){if(!this.segmentClear(route[anchor],route[next]))break;far=next;}smooth.push(route[far]);anchor=far;}return smooth;}
   closed[id]=1;const x=id%this.cols,y=Math.floor(id/this.cols),here=this.center(id);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy,n=ny*this.cols+nx;if(nx<0||ny<0||nx>=this.cols||ny>=this.rows||!this.reachable[n]||closed[n])continue;if(dx&&dy&&(!this.cells[y*this.cols+nx]||!this.cells[ny*this.cols+x]))continue;const next=this.center(n);if(!this.segmentClear(here,next))continue;const cost=costs[id]+Math.hypot(dx,dy)*24;if(cost>=costs[n])continue;costs[n]=cost;parents[n]=id;heap.push(n,cost+Math.hypot(next.x-target.x,next.y-target.y));}
  }return null;
 }
}
