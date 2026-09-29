import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { WorldInteraction } from '../ui/WorldInteraction';
import { objectPresent } from '../domain/exploration/worldState';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { gameStore, actions } from '../state/gameStore';
import { GameCanvas } from '../ui/GameCanvas';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';
import { WORLD_OBJECTS } from '../domain/maps/meadow';
import { RESOURCES, type ResourceId } from '../domain/resources/catalog';
import { ENERGY } from '../domain/energy/energy';
import { requiredXp } from '../domain/progression/progression';
import { audioService } from '../audio/audioService';

type Panel = 'inventory' | 'settings' | 'help' | 'energy' | null;

export function App() {
  const state = useStore(gameStore, useShallow(({data,ready,fatal,selectedId,saveStatus,notice,noticeId,zoneName,feedback})=>({data,ready,fatal,selectedId,saveStatus,notice,noticeId,zoneName,feedback})));
  const { data, ready, fatal, saveStatus, notice, noticeId, zoneName } = state;
  const [panel, setPanel] = useState<Panel>(null);
  const [now, setNow] = useState(Date.now());
  const [devTaps, setDevTaps] = useState(0);
  const [resetText, setResetText] = useState('');
  const [toast, setToast] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration;
    }
  });

  useEffect(() => {
    actions.boot();
    const online = () => { void registrationRef.current?.update().catch(() => {}); };
    window.addEventListener('online', online);
    const timer = window.setInterval(() => { if (!document.hidden) { setNow(Date.now()); actions.reconcile(); } }, 1000);
    const visibility = () => {
      if (document.hidden) { actions.flush(); audioService.suspend(); }
      else { actions.reconcile(); setNow(Date.now()); }
    };
    const resume = () => { actions.reconcile(); setNow(Date.now()); };
    window.addEventListener('pagehide', actions.flush);
    window.addEventListener('pageshow', resume);
    window.addEventListener('storage', actions.receiveExternal);
    document.addEventListener('visibilitychange', visibility);
    // Advisory only: normal Safari storage remains usable if this is denied.
    void navigator.storage?.persist?.().catch(() => {});
    return () => {
      window.removeEventListener('online', online);
      clearInterval(timer); window.removeEventListener('pagehide', actions.flush);
      window.removeEventListener('pageshow', resume); window.removeEventListener('storage', actions.receiveExternal);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (!noticeId) return;
    setToast(true);
    const timeout = setTimeout(() => setToast(false), 3400);
    return () => clearTimeout(timeout);
  }, [noticeId]);

  const nextEnergy = Math.max(1, Math.ceil((ENERGY.regenerationMs - (now - data.energy.regeneratedAt) % ENERGY.regenerationMs) / 1000));
  const open = (value: Panel) => { actions.selectObject(null); setPanel(value); };
  const focusResource = (id: string) => { setPanel(null); actions.selectObject(id); };

  if (fatal) return <main className="fatal"><Icon name="leaf" size={34} /><h1>Seu cantinho está guardado.</h1><p>{fatal}</p><button className="primary-button" onClick={() => location.reload()}>Tentar novamente</button></main>;

  return <main className={`game-shell ${data.settings.reducedMotion ? 'reduced-motion' : ''}`} onPointerDown={() => { if (data.settings.sound) void audioService.unlock(); }}>
    {ready && <GameCanvas />}
    <div className="atmosphere" aria-hidden="true" />
    <header className="hud">
      <div className="brand-row"><div className="wordmark"><Icon name="sprout" size={21} /><span>AuraFarm</span></div><span className="chapter-label">SEU PEQUENO MUNDO</span></div>
      <div className="stats-row">
        <button className="level-stat" onClick={() => open('help')} aria-label={`Nível ${data.progression.level}. ${data.progression.xp} de ${requiredXp(data.progression.level)} de experiência.`}>
          <span className="level-emblem"><Icon name="sparkles" size={19} /></span><span><small>NÍVEL</small><strong>{data.progression.level}</strong></span>
          <span className="xp-track"><i style={{ width: `${data.progression.xp / requiredXp(data.progression.level) * 100}%` }} /></span>
        </button>
        <button className="energy-stat" onClick={() => open('energy')} aria-label={`Energia: ${data.energy.current} de ${data.energy.max}`}>
          <Icon name="energy" size={20} /><span><strong>{data.energy.current}<em> / {data.energy.max}</em></strong><small>{data.energy.current === data.energy.max ? 'Pronto para explorar' : `+${ENERGY.regenerationAmount} em ${nextEnergy}s`}</small></span>
        </button>
        <button className="wood-stat" onClick={() => open('inventory')} aria-label={`${data.inventory.wood} madeiras. Abrir mochila`}><Icon name="wood" size={21} /><strong>{data.inventory.wood}</strong></button>
      </div>
      {state.feedback?.energy ? <span key={state.feedback.serial} className={`energy-change ${state.feedback.energy>0?'gain':''}`}>{state.feedback.energy>0?'+':''}{state.feedback.energy} <Icon name="energy" size={12}/></span> : null}
      <div className="resource-strip" aria-label="Recursos">{(['wood','stone','fiber'] as const).map(id=><span key={id}><Icon name={id==='fiber'?'leaf':id} size={13}/><b>{data.inventory[id]}</b></span>)}</div>
      <div className="location"><span />{zoneName}<span /></div>
    </header>

    <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{notice}</div>

    <section className="bottom-ui" aria-label="Controles do jogo">
      {saveStatus === 'error' && <div className="save-warning" role="alert">O salvamento está indisponível. Mantenha o jogo aberto até aparecer “Progresso salvo”.</div>}
      {!state.selectedId && <div className="explore-hint">Toque em um obstáculo para limpar. O portão guarda um novo recanto.</div>}
      <nav className="toolbar" aria-label="Menu do jogo">
        <button className="tool" onClick={() => open('inventory')}><span className="tool-icon"><Icon name="backpack" size={23} /></span><span>Mochila</span></button>
        <div className="save-indicator"><span><Icon name={saveStatus === 'saved' ? 'check' : 'help'} size={12} />{saveStatus === 'saved' ? 'Progresso salvo' : 'Aguardando salvamento'}</span><small>explore no seu ritmo</small></div>
        <button className="tool" onClick={() => open('settings')}><span className="tool-icon"><Icon name="settings" size={22} /></span><span>Ajustes</span></button>
      </nav>
    </section>

    <WorldInteraction />
    <div className="rotate-device" role="status"><span className="rotate-icon"><Icon name="rotate" size={42} /></span><div className="wordmark">AuraFarm</div><h2>Um mundo para ver de lado.</h2><p>Gire seu iPhone para a horizontal<br />e entre na clareira.</p><small>Se a tela não girar, desative o bloqueio de rotação.</small></div>
    {panel && <Sheet title={panel === 'inventory' ? 'Sua mochila' : panel === 'settings' ? 'Do seu jeito' : panel === 'energy' ? 'Energia para explorar' : 'Um novo começo'} close={() => setPanel(null)}>
      {panel === 'inventory' && <>
        <p className="sheet-intro">Pequenos achados, novas possibilidades.</p>
        <div className="inventory-list">{(Object.keys(RESOURCES) as ResourceId[]).map(id => <div className="inventory-item" key={id}><span className={`resource-icon ${id}`}><Icon name={id === 'stone' ? 'stone' : id === 'wood' ? 'wood' : id === 'fiber' ? 'flower' : 'leaf'} size={25} /></span><div><strong>{RESOURCES[id].name}</strong><small>{id === 'berry' ? `Recupera ${ENERGY.berryRecovery} de energia` : 'Um recurso para o que vem a seguir'}</small></div><b>{data.inventory[id]}</b></div>)}</div>
        <button className="primary-button full" onClick={actions.eatBerry} disabled={!data.inventory.berry || data.energy.current >= data.energy.max}>Comer uma amora <span>+{ENERGY.berryRecovery} <Icon name="energy" size={14} /></span></button>
        {data.energy.current >= data.energy.max && <p className="footnote">Sua energia está cheia. O lanche pode esperar.</p>}
      </>}
      {panel === 'energy' && <>
        <div className="energy-summary"><Icon name="energy" size={28} /><strong>{data.energy.current}<small> / {data.energy.max}</small></strong></div>
        <p className="sheet-intro">A energia cuida do ritmo da exploração. A clareira continua sendo sua, mesmo quando ela acaba.</p>
        <div className="explanation-line"><Icon name="leaf" /><span>{ENERGY.regenerationAmount} pontos a cada {ENERGY.regenerationMs / 1000} segundos, inclusive enquanto você está fora.</span></div>
        <div className="explanation-line"><Icon name="flower" /><span>Caminhar, observar e colher amoras não gastam energia. Aproveite a exploração com calma.</span></div>
        <button className="primary-button full" disabled={!data.inventory.berry || data.energy.current >= data.energy.max} onClick={actions.eatBerry}>Comer amora ({data.inventory.berry}) <span>+{ENERGY.berryRecovery} <Icon name="energy" size={14} /></span></button>
      </>}
      {panel === 'settings' && <>
        <p className="sheet-intro">Encontre o seu ritmo na clareira.</p>
        {([
          ['sound', 'Sons suaves', 'Preferência guardada para suas aventuras'],
          ['haptics', 'Resposta ao toque', 'Quando disponível no aparelho'],
          ['reducedMotion', 'Movimentos suaves', 'Reduz as animações do cenário']
        ] as const).map(([key, label, detail]) => <label className="setting-row" key={key}><span><strong>{label}</strong><small>{detail}</small></span><input type="checkbox" checked={data.settings[key]} onChange={event => { if (key === 'sound' && event.target.checked) void audioService.unlock(); actions.settings({ [key]: event.target.checked }); }} /><span className="switch" aria-hidden="true" /></label>)}
        <button className="text-link" onClick={() => setPanel('help')}><Icon name="help" size={18} />Como aproveitar a clareira<Icon name="chevron" size={17} /></button>
        {needRefresh && <button className="primary-button full" onClick={() => { actions.flush(); if (gameStore.getState().saveStatus === 'saved') void updateServiceWorker(true); }}>Salvar e atualizar o jogo</button>}
        <button className="version-tap" onClick={()=>setDevTaps(value=>value+1)}>AuraFarm · versão 0.3</button>
        {devTaps>=7 && <div className="dev-reset"><strong>Desenvolvimento · novo começo</strong><p>Arquiva o save atual neste aparelho e reinicia apenas o AuraFarm. Digite RECOMEÇAR para confirmar.</p><input aria-label="Confirmação do reset de desenvolvimento" value={resetText} onChange={event=>setResetText(event.target.value)} placeholder="RECOMEÇAR"/><button className="text-link" disabled={resetText!=='RECOMEÇAR'} onClick={()=>{actions.resetDevelopment();setResetText('');setDevTaps(0);setPanel(null);}}>Arquivar e recomeçar</button></div>}
        <p className="footnote">Cada pequeno caminho aberto guarda uma descoberta.</p>
      </>}
      {panel === 'help' && <>
        <p className="sheet-intro">Deite o iPhone e explore a propriedade no seu ritmo. A câmera acompanha você.</p>
        <ol className="help-list"><li>Toque no chão livre para caminhar. Seu personagem contorna os obstáculos.</li><li>Toque nos galhos, pedras ou arbustos para ver o custo. Toque em Limpar para se aproximar e agir.</li><li>Limpe os três bloqueios da trilha ao norte para abrir o Recanto das Samambaias. Colete amoras de graça e coma na mochila para recuperar energia.</li></ol>
        <div className="find-list">{WORLD_OBJECTS.filter(item => ['trail-branches', 'trail-log', 'trail-thicket', 'meadow-berries', 'fern-bench'].includes(item.id) && objectPresent(item,data)).map(item => <button key={item.id} onClick={() => focusResource(item.id)}><Icon name={item.interaction?.future ? 'compass' : 'leaf'} size={18} />{item.interaction?.name}<Icon name="chevron" size={16} /></button>)}</div>
        <p className="install-note"><strong>Leve a clareira com você</strong>No Safari, toque em Compartilhar e em “Adicionar à Tela de Início”. Depois da primeira abertura completa, o jogo também pode abrir sem internet.</p>
        <p className="footnote">Nível {data.progression.level} · {data.progression.xp}/{requiredXp(data.progression.level)} de experiência.<br />O progresso fica neste navegador; sincronização entre aparelhos virá depois. Apagar os dados do site também apaga o salvamento.</p>
      </>}
    </Sheet>}
  </main>;
}
