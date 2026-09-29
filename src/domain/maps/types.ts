import type { Position } from '../player/types';
export type CollisionShape = {type:'rect';x:number;y:number;width:number;height:number}|{type:'ellipse';x:number;y:number;radiusX:number;radiusY:number};
export type SceneryKind='tree'|'pine'|'goldTree'|'rock'|'bush'|'flowers'|'cabin'|'sign'|'gate'|'bridge'|'bench'|'wood';
export interface SceneryObject extends Position {id:string;kind:SceneryKind;scale:number;solid?:CollisionShape;interaction?:{name:string;description:string;approach:Position;future?:boolean}}
export interface WorldDefinition {id:string;revision:number;name:string;width:number;height:number;spawn:Position;boundary:Position[];blockedAreas:CollisionShape[];objects:SceneryObject[];paths:Position[][];zones:{name:string;bounds:CollisionShape}[]}
