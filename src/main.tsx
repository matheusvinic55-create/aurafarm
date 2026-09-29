import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './ui/styles.css';
import { registerSW } from 'virtual:pwa-register';

// Installed iOS PWAs must pick up each production deploy without reinstalling.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    const check = () => registration?.update().catch(() => undefined);
    check();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
    window.addEventListener('focus', check);
  },
  onNeedRefresh() { void updateSW(true); }
});

// Keep the game surface stable on Safari, while dialogs can scroll internally.
document.addEventListener('gesturestart', event => event.preventDefault(), { passive: false });
createRoot(document.getElementById('root')!).render(<App />);
