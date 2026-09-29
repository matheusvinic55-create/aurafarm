import type { SaveData } from '../../persistence/schema';
export type QuestKind = 'main' | 'side';
export type ObjectiveKind = 'visit' | 'inventory' | 'harvest' | 'production' | 'talk';
export interface QuestObjective { id:string; label:string; kind:ObjectiveKind; target:string; amount:number }
export interface QuestReward { xp:number; coins?:number; items?:Partial<Record<keyof SaveData['inventory'],number>> }
export interface QuestDefinition { id:string; kind:QuestKind; title:string; giver:string; summary:string; objectives:QuestObjective[]; reward:QuestReward; requires?:string }
export const QUESTS:QuestDefinition[]=[
{id:'welcome',kind:'main',title:'Um lugar para começar',giver:'lia',summary:'Conheça a clareira e encontre Lia perto da Casa do Ipê.',objectives:[{id:'home',label:'Visite a Casa do Ipê',kind:'visit',target:'home',amount:1},{id:'lia',label:'Converse com Lia',kind:'talk',target:'lia',amount:1}],reward:{xp:60,coins:20}},
{id:'first-harvest',kind:'main',title:'Sementes de amanhã',giver:'lia',summary:'Colha sua primeira plantação e leve o resultado para Lia.',requires:'welcome',objectives:[{id:'crop',label:'Colha 1 cultivo',kind:'harvest',target:'any',amount:1}],reward:{xp:80,coins:25,items:{wheatSeed:2,cornSeed:2,carrotSeed:2}}},
{id:'open-grove',kind:'main',title:'A trilha esquecida',giver:'bento',summary:'Ajude Bento a reabrir o caminho tomado pela vegetação.',requires:'first-harvest',objectives:[{id:'trail',label:'Visite o Recanto das Samambaias',kind:'visit',target:'fern-bench',amount:1}],reward:{xp:110,coins:40}},
{id:'grove-gift',kind:'main',title:'O que o recanto guardou',giver:'bento',summary:'Explore o recanto e reúna um pouco do que a mata deixou.',requires:'open-grove',objectives:[{id:'wood',label:'Tenha 5 madeiras',kind:'inventory',target:'wood',amount:5},{id:'stone',label:'Tenha 3 pedras',kind:'inventory',target:'stone',amount:3}],reward:{xp:120,coins:45}},
{id:'warm-kitchen',kind:'main',title:'Cheiro de casa',giver:'nina',summary:'Prepare algo na cozinha para devolver calor à clareira.',requires:'grove-gift',objectives:[{id:'food',label:'Prepare e colete 1 receita',kind:'production',target:'any',amount:1}],reward:{xp:130,coins:55,items:{berry:2}}},
{id:'three-voices',kind:'main',title:'Três vozes na clareira',giver:'nina',summary:'Converse com quem escolheu chamar este lugar de casa.',requires:'warm-kitchen',objectives:[{id:'lia',label:'Converse com Lia',kind:'talk',target:'lia',amount:1},{id:'bento',label:'Converse com Bento',kind:'talk',target:'bento',amount:1},{id:'nina',label:'Converse com Nina',kind:'talk',target:'nina',amount:1}],reward:{xp:160,coins:75}},
{id:'berries',kind:'side',title:'Doce no caminho',giver:'nina',summary:'Nina sempre guarda amoras para os dias longos.',objectives:[{id:'berries',label:'Tenha 3 amoras',kind:'inventory',target:'berry',amount:3}],reward:{xp:45,coins:15}},
{id:'wanderer',kind:'side',title:'Sem pressa',giver:'bento',summary:'Passe por alguns cantos da propriedade só porque eles existem.',objectives:[{id:'pond',label:'Visite o banco do lago',kind:'visit',target:'pond-bench',amount:1},{id:'sign',label:'Visite a placa da clareira',kind:'visit',target:'welcome-sign',amount:1}],reward:{xp:55,coins:20}}
];
export const questById=(id:string)=>QUESTS.find(q=>q.id===id);
