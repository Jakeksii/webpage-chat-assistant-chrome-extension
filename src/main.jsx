import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { IndexedDBProvider } from './DB.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IndexedDBProvider>
      <App />
    </IndexedDBProvider>
  </StrictMode>,
)
