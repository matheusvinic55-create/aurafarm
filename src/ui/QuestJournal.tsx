import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { gameStore, actions } from '../state/gameStore';
import { QUESTS, questById } from '../domain/quests/catalog';
import { objectiveValue } from '../domain/quests/system';
import { characterById, dialogueFor } from '../domain/characters/catalog';
import { Icon } from './Icon';
export function QuestJournal(){
 const data=useStore(gameStore,useShallow(s=>s.data));const ordered=[...data.quests].sort((a,b)=>a.status==='claimed'?1:b.status==='claimed'?-1:0);
 return <div className="quest-journal"><p className="sheet-intro">A clareira deixa pistas, não cobranças. Faça o que chamar você; nenhuma missão expira.</p>{ordered.map(p=>{const q=questById(p.id);if(!q)return null;return <article className={'quest-card '+p.status} key={q.id}><div className="quest-head"><span>{q.kind==='main'?'CAMINHO PRINCIPAL':'DESCOBERTA'}</span><b>{p.status==='claimed'?'Concluída':p.status==='complete'?'Pronta para entregar':'Em andamento'}</b></div><h3>{q.title}</h3><p>{q.summary}</p><div className="quest-objectives">{q.objectives.map(o=>{const v=Math.min(o.amount,objectiveValue(data,o.kind,o.target));return <div key={o.id}><Icon name={v>=o.amount?'check':'leaf'} size={14}/><span>{o.label}</span><b>{v}/{o.amount}</b></div>})}</div><small className="quest-reward">+{q.reward.xp} XP{q.reward.coins?' · +'+q.reward.coins+' moedas':''}</small>{p.status==='complete'&&<button className="primary-button full" onClick={()=>actions.claimQuest(q.id)}>Receber recompensa</button>}</article>})}</div>
}
export function CharacterDialogue({id,close}:{id:string;close:()=>void}){const data=useStore(gameStore,useShallow(s=>s.data));const c=characterById(id);if(!c)return null;const friendship=data.characters[id]?.friendship??0;const related=QUESTS.find(q=>q.giver===id&&data.quests.some(p=>p.id===q.id&&p.status!=='claimed'));return <div className="dialogue-card" role="dialog" aria-label={'Conversa com '+c.name}><button className="dialogue-close" onClick={close} aria-label="Fechar"><Icon name="close" size={18}/></button><span className="npc-avatar">{c.name[0]}</span><div className="dialogue-copy"><small>{c.role}</small><h3>{c.name}</h3><p>{dialogueFor(id,friendship)}</p>{related&&<em>{related.title}</em>}<button onClick={()=>actions.talkCharacter(id)}>Continuar conversa</button></div></div>}
