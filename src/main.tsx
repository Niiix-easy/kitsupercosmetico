import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initConsoleTracker } from './utils/consoleCleaner';

// Initialize console tracking and buffering early to capture startup logs for Sentry
initConsoleTracker();

createRoot(document.getElementById('root')!).render(<App />);
