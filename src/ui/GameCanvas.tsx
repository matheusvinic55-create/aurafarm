import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';

export function GameCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    let game: Phaser.Game | undefined;
    let observer: ResizeObserver | undefined;
    const resize = () => {
      if (!game || !host.current) return;
      game.scale.resize(host.current.clientWidth, host.current.clientHeight);
    };
    const resume = () => { if (!document.hidden) { game?.loop.wake(); resize(); } };
    void import('../engine/createGame').then(({ createGame }) => {
      if (disposed || !host.current) return;
      game = createGame(host.current);
      game.events.once('ready', () => { if (!disposed) setLoaded(true); });
      observer = new ResizeObserver(resize); observer.observe(host.current);
      window.addEventListener('pageshow', resume);
      document.addEventListener('visibilitychange', resume);
      window.visualViewport?.addEventListener('resize', resize);
      game.canvas.addEventListener('webglcontextrestored', resume);
    }).catch(() => { if (!disposed) setError(true); });
    return () => {
      disposed = true; observer?.disconnect();
      window.removeEventListener('pageshow', resume);
      document.removeEventListener('visibilitychange', resume);
      window.visualViewport?.removeEventListener('resize', resize);
      game?.canvas.removeEventListener('webglcontextrestored', resume);
      game?.destroy(true);
    };
  }, []);
  return <>
    <div ref={host} className="game-canvas" role="application" aria-label="Clareira: toque no chão para caminhar. Toque nos obstáculos para ver o custo e limpar. Colha amoras sem gastar energia. Jogue com o aparelho na horizontal." />
    {!loaded && <div className="loading-scene"><span className="loading-leaf">✦</span><p>{error ? 'Não foi possível abrir a clareira.' : 'Preparando seu cantinho…'}</p>{error && <button onClick={() => location.reload()}>Tentar novamente</button>}</div>}
  </>;
}
