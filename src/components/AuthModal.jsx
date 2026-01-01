import React, { useState } from 'react'
import { signUp, signIn } from '../services/auth'
import '../../css/components.css' // Reusing component styles for modal

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        let result
        if (isLogin) {
            result = await signIn(email, password)
        } else {
            result = await signUp(email, password)
        }

        setLoading(false)

        if (result.error) {
            setMessage(result.error.message)
        } else {
            if (isLogin) {
                // Immediate success action, no message in modal needed
                if (onLoginSuccess) {
                    onLoginSuccess(email);
                } else {
                    onClose();
                }
            } else {
                setMessage('Check je email voor de bevestigingslink!')
            }
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isLogin ? 'Inloggen' : 'Registreren'}</h2>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="password"
                            placeholder="Wachtwoord"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" disabled={loading} className="btn full-width" style={{ marginTop: '10px' }}>
                            {loading ? 'Laden...' : (isLogin ? 'Log in' : 'Registreer')}
                        </button>
                    </form>
                    {message && <p style={{ marginTop: '10px', color: message.includes('error') ? 'red' : 'green' }}>{message}</p>}
                    <p style={{ marginTop: '15px', fontSize: '0.9em', textAlign: 'center' }}>
                        {isLogin ? "Nog geen account?" : "Heb je al een account?"}{' '}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
                            style={{ background: 'none', border: 'none', color: '#8E1600', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {isLogin ? "Registreer hier" : "Log hier in"}
                        </button>
                    </p>
                </div>
                <div className="modal-actions">
                    <button className="btn" onClick={onClose}>Sluiten</button>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
