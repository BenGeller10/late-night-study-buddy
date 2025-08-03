import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSounds } from './lib/sounds'

// Initialize sound effects
initializeSounds();

createRoot(document.getElementById("root")!).render(<App />);
