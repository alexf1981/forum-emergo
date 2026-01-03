import React, { useState } from 'react'
import { signUp, signIn } from '../services/auth'
import '../../css/components.css'
import { useLanguage } from '../context/LanguageContext';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { t } = useLanguage();
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

        try {
            let result
            if (isLogin) {
                result = await signIn(email, password)
            } else {
                result = await signUp(email, password)
            }

            if (result.error) {
                setMessage(result.error.message)
            } else {
                if (isLogin) {
                    if (onLoginSuccess) {
                        onLoginSuccess(email);
                    } else {
                        onClose();
                    }
                } else {
                    setMessage(t('msg_check_email') || 'Check email for confirmation!')
                }
            }
        } catch (error) {
            console.error("Auth error:", error)
            setMessage(error.message || "An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isLogin ? t('login_header') : t('register_header')}</h2>
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
                            placeholder={t('password') || "Password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" disabled={loading} className="btn full-width" style={{ marginTop: '10px' }}>
                            {loading ? t('loading') : (isLogin ? t('login_btn') : t('register_btn'))}
                        </button>
                    </form>
                    {message && <p style={{ marginTop: '10px', color: message.includes('error') ? 'red' : 'green' }}>{message}</p>}
                    <p style={{ marginTop: '15px', fontSize: '0.9em', textAlign: 'center' }}>
                        {isLogin ? t('no_account') : t('has_account')}{' '}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
                            style={{ background: 'none', border: 'none', color: '#8E1600', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {isLogin ? t('register_link') : t('login_link')}
                        </button>
                    </p>
                </div>
                <div className="modal-actions">
                    <button className="btn" onClick={onClose}>{t('close')}</button>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
