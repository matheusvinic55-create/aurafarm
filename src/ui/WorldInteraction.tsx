import { useStore } from 'zustand';
import { gameStore, actions } from '../state/gameStore';
import { findWorldObject, TRAIL_BLOCKERS } from '../domain/maps/meadow';
import { BALANCE } from '../config/balance';
import { RESOURCES, type ResourceId } from '../domain/resources/catalog';
import { Icon } from './Icon';

/** Camera coordinates remain session-only. Only this small overlay follows them. */
export function WorldInteraction() {
  const id = useStore(gameStore, state => state.selectedId);
  const anchor = useStore(gameStore, state => state.anchor);
  const data = useStore(gameStore, state => state.data);
  const object = id ? findWorldObject(id) : undefined;
  if (!object?.interaction || !anchor) return null;
  const config = object.obstacleType ? BALANCE.obstacles[object.obstacleType] : null;
  const progress = data.exploration.obstacles[object.id]?.hits ?? 0;
  const berries = object.id === 'meadow-berries';
  // World actions happen directly in the scene; never show a confirmation card.
  return null;
  const reward = config ? Object.entries(config.rewards).map(([key, amount]) => `${amount} ${RESOURCES[key as ResourceId].plural}`).join(' · ') : '';
  return <aside className="world-interaction" style={{left:`clamp(145px, ${anchor.x}px, calc(100vw - 145px))`,top:`clamp(66px, ${anchor.y-155}px, calc(100dvh - 175px))`}} aria-label="Interação com o mundo">
    <div className="interaction-title"><strong>{object.interaction.name}</strong><button className="icon-button" aria-label="Fechar identificação" onClick={()=>actions.selectObject(null)}><Icon name="close" size={14}/></button></div>
    {config ? <><small>{reward}{config.hits>1 ? ` · ${progress}/${config.hits} ações` : ''}</small><button className="harvest-button" onClick={()=>actions.requestInteraction(object.id)}><span>{progress?'Continuar limpando':'Limpar'}</span><span><Icon name="energy" size={14}/>{config.cost}</span></button></> : berries ? <><small>Um lanche para continuar a exploração</small><button className="harvest-button" onClick={()=>actions.requestInteraction(object.id)}><span>Colher amoras</span><span>Grátis</span></button></> : <p>{object.id==='old-gate'?`${TRAIL_BLOCKERS.filter(id=>!data.exploration.obstacles[id]?.removed).length} bloqueios na trilha. Comece pelos galhos e siga até o portão.`:object.interaction.description}</p>}
  </aside>;
}
