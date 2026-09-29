import type { SaveData } from '../../persistence/schema';
import { gainXp } from '../progression/progression';
import { QUESTS, questById, type QuestDefinition } from './catalog';
const story=(data:SaveData)=>data.characters.__story?.storyFlags??[];
export function objectiveValue(data:SaveData,kind:string,target:string){
 if(kind==='inventory') return Number(data.inventory[target as keyof SaveData['inventory']]??0);
 if(kind==='visit') return Object.values(data.maps).some(map=>map.visitedPlaces.includes(target))?1:0;
 if(kind==='talk') return story(data).includes('talk:'+target)?1:0;
 if(kind==='harvest') return story(data).filter(x=>x.startsWith('harvest:')).length;
 if(kind==='production') return story(data).filter(x=>x.startsWith('production:')).length;
 return 0;
}
export function availableQuest(data:SaveData,q:QuestDefinition){return !q.requires||data.quests.some(p=>p.id===q.requires&&p.status==='claimed')}
export function syncQuests(data:SaveData){
 for(const q of QUESTS) if(availableQuest(data,q)&&!data.quests.some(p=>p.id===q.id)) data.quests.push({id:q.id,status:'active',objectives:{}});
 for(const p of data.quests){const q=questById(p.id);if(!q||p.status==='claimed')continue;p.objectives=Object.fromEntries(q.objectives.map(o=>[o.id,Math.min(o.amount,objectiveValue(data,o.kind,o.target))]));if(q.objectives.every(o=>(p.objectives[o.id]??0)>=o.amount))p.status='complete';}
}
export function storyFlag(data:SaveData,value:string){data.characters.__story??={friendship:0,storyFlags:[]};if(!data.characters.__story.storyFlags.includes(value))data.characters.__story.storyFlags.push(value);syncQuests(data)}
export function claimQuest(data:SaveData,id:string){syncQuests(data);const p=data.quests.find(x=>x.id===id),q=questById(id);if(!p||!q||p.status!=='complete')return false;p.status='claimed';data.progression=gainXp(data.progression,q.reward.xp);data.wallet.coins+=q.reward.coins??0;for(const [key,value] of Object.entries(q.reward.items??{}))data.inventory[key as keyof SaveData['inventory']]+=value??0;syncQuests(data);return true}
