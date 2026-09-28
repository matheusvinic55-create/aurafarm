import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './ui/styles.css';

// Keep the game surface stable on Safari, while dialogs can scroll internally.
document.addEventListener('gesturestart', event => event.preventDefault(), { passive: false });
createRoot(document.getElementById('root')!).render(<App />);
