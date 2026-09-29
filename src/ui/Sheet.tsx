import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Sheet({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="sheet" aria-labelledby="sheet-title" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="sheet-inner">
      <div className="sheet-handle" />
      <header className="sheet-header"><h2 id="sheet-title">{title}</h2><button className="icon-button" aria-label="Fechar" onClick={close}><Icon name="close" /></button></header>
      {children}
    </div>
  </dialog>;
}
