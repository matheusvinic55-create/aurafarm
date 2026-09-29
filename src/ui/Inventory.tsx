import { useState } from 'react';
import { useStore } from 'zustand';
import { gameStore, actions } from '../state/gameStore';
import { ITEMS, CATEGORIES, itemDefinition, type ItemCategory, type ItemId } from '../domain/inventory/catalog';
import { Icon } from './Icon';
export function Inventory() {
  const [category, setCategory] = useState<ItemCategory>('resources');
  const [selected, setSelected] = useState<ItemId | null>(null);
  const data = useStore(gameStore, state => state.data);
  const ids = (Object.keys(ITEMS) as ItemId[]).filter(id => category === 'energy' ? Boolean(itemDefinition(id).recovery) : ITEMS[id].category === category);
  const item = selected && ids.includes(selected) ? itemDefinition(selected) : null;
  return <div className="backpack-content"><nav className="inventory-tabs" aria-label="Categorias da mochila">{CATEGORIES.map(({ id, name }) => <button key={id} aria-pressed={category === id} onClick={() => { setCategory(id); setSelected(null); }}>{name}</button>)}</nav>
    <div className="inventory-grid">{ids.map(id => <button key={id} className={`inventory-slot ${selected === id ? 'chosen' : ''}`} onClick={() => setSelected(id)} aria-label={`${ITEMS[id].name}, quantidade ${data.inventory[id]}`}><span aria-hidden="true">{ITEMS[id].icon}</span><b>{data.inventory[id]}</b><strong>{ITEMS[id].name}</strong></button>)}</div>
    <div className="inventory-detail">{item && selected ? <><div><strong>{item.name}</strong><p>{item.description}{item.recovery ? ` Recupera até ${item.recovery} de energia.` : ''}</p></div>{item.recovery && <button className="primary-button" disabled={!data.inventory[selected] || data.energy.current >= data.energy.max} onClick={() => actions.eatItem(selected)}>{data.energy.current >= data.energy.max ? 'Energia cheia' : 'Comer'}<Icon name="energy" size={15}/></button>}</> : <p>Toque em um item para ver seus usos. Há espaço para toda a sua colheita.</p>}</div>
  </div>;
}
