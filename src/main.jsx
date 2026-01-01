import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import { AuthProvider } from './context/AuthContext'

// Import CSS
import '../css/base.css'
import '../css/layout.css'
import '../css/components.css'
import '../css/game.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {console.log("App is mounting...")}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
