import { useStore } from 'zustand';
import { gameStore, actions } from '../state/gameStore';
import { CROPS, PLOTS, STATIONS, type CropId } from '../domain/farming/catalog';
import { RECIPES, type RecipeId } from '../domain/production/catalog';
import { ITEMS, type ItemId } from '../domain/inventory/catalog';
import { cropProgress, remainingTime } from '../domain/farming/time';
import { FARM_BALANCE } from '../config/farming';
import type { FarmCommand } from '../domain/farming/types';
import { Icon } from './Icon';

/** Only productive farm interactions open a compact overlay. Scenery cards remain removed. */
export function FarmInteraction({ now }: { now: number }) {
  const id = useStore(gameStore, state => state.selectedId);
  const anchor = useStore(gameStore, state => state.anchor);
  const data = useStore(gameStore, state => state.data);
  const plot = PLOTS.find(p => p.id === id);
  const station = STATIONS.find(s => s.id === id);
  if ((!plot && !station) || !id || !anchor) return null;
  const crop = data.crops.find(c => c.plotId === id);
  const job = data.production.find(j => j.stationId === id);
  const act = (command: FarmCommand) => { actions.selectObject(null); actions.requestFarm(command); };
  return <aside className={`farm-interaction ${station ? 'farm-production' : ''}`} style={{ left: `clamp(calc(env(safe-area-inset-left, 0px) + 154px), ${anchor.x}px, calc(100vw - env(safe-area-inset-right, 0px) - 154px))`, top: `clamp(76px, ${anchor.y - 210}px, calc(100dvh - env(safe-area-inset-bottom, 0px) - ${station ? 282 : 212}px))` }} aria-label={station ? station.name : 'Canteiro'}>
    <div className="interaction-title"><strong>{station ? station.name : crop ? CROPS[crop.cropId].name : data.farm.plots[id]?.prepared ? 'Pronto para replantar' : 'Um pequeno começo'}</strong><button className="icon-button" aria-label="Fechar" onClick={() => actions.selectObject(null)}><Icon name="close" size={17}/></button></div>
    {plot && !crop && <><p className="farm-note">Escolha uma semente · sem gasto de energia</p><div className="seed-choices">{(Object.keys(CROPS) as CropId[]).map(cropId => {
      const definition = CROPS[cropId];
      return <button key={cropId} disabled={data.inventory[definition.seed] < FARM_BALANCE.seedCost} onClick={() => act({ kind: 'plant', targetId: id, cropId })} aria-label={`Plantar ${definition.name}, ${data.inventory[definition.seed]} sementes`}><span className="seed-art" aria-hidden="true">{definition.icon}</span><strong>{definition.name}</strong><small>{definition.durationMs / 1000}s · ×{data.inventory[definition.seed]}</small></button>;
    })}</div><p className="farm-note subtle">Cada colheita devolve sementes.</p></>}
    {crop && <><p className="farm-note">{now >= crop.readyAt ? 'Sua colheita chegou!' : `Colheita em ${remainingTime(crop.readyAt, now)}${crop.watered ? ' · regada' : ''}`}</p><div className="farm-progress" role="progressbar" aria-label="Crescimento" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cropProgress(crop, now) * 100)}><i style={{ width: `${cropProgress(crop, now) * 100}%` }}/></div>{now >= crop.readyAt ? <button className="harvest-button" onClick={() => act({ kind: 'harvest', targetId: id })}>Colher <span>+{CROPS[crop.cropId].yield} {CROPS[crop.cropId].icon}</span></button> : !crop.watered ? <button className="harvest-button" onClick={() => act({ kind: 'water', targetId: id })}>Regar uma vez <span>−{FARM_BALANCE.wateringBonus * 100}% do tempo</span></button> : <p className="farm-note subtle">Tudo cuidado. Pode explorar com calma.</p>}<p className="farm-note subtle">Cresce fora do jogo. Nunca murcha.</p></>}
    {station && (job ? <><div className="cooking-status"><span aria-hidden="true">{ITEMS[job.product].icon}</span><div><strong>{ITEMS[job.product].name} ×{job.quantity}</strong><small>{now >= job.readyAt ? 'Prontinho para levar' : `Preparando · ${remainingTime(job.readyAt, now)}`}</small></div></div><div className="farm-progress"><i style={{ width: `${Math.max(0, Math.min(100, (now - job.startedAt) / job.durationMs * 100))}%` }}/></div>{now >= job.readyAt ? <button className="harvest-button" onClick={() => act({ kind: 'collect', targetId: id })}>Guardar na mochila <Icon name="backpack" size={16}/></button> : <p className="farm-note">Continua preparando com o jogo fechado.</p>}</> : <><p className="farm-note">Uma receita por vez · sem energia</p><div className="recipe-list">{(Object.keys(RECIPES) as RecipeId[]).map(recipeId => {
      const recipe = RECIPES[recipeId];
      const ingredients = Object.entries(recipe.ingredients) as [ItemId, number][];
      const available = ingredients.every(([item, count]) => data.inventory[item] >= count);
      return <button className="recipe" key={recipeId} disabled={!available} onClick={() => act({ kind: 'produce', targetId: id, recipeId })}><span className="recipe-icon" aria-hidden="true">{ITEMS[recipe.product].icon}</span><span><strong>{ITEMS[recipe.product].name} ×{recipe.quantity}</strong><small>{ingredients.map(([item, count]) => `${ITEMS[item].name} ${data.inventory[item]}/${count}`).join(' · ')}</small></span><em>{recipe.durationMs / 1000}s</em></button>;
    })}</div></>)}
  </aside>;
}
