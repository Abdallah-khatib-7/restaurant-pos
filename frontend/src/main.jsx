import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
 
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#292524',
              color: '#fef3c7',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#f59e0b', secondary: '#1c1917' }
            },
            error: {
              iconTheme: { primary: '#9f1239', secondary: '#fef3c7' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)