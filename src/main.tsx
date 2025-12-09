import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GameCanvas from './pages/battle/walk.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameCanvas />

  </StrictMode>,
)