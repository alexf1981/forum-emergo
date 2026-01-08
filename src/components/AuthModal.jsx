
import React, { useState } from 'react'
import { signUp, signIn } from '../services/auth'
import '../../css/components.css'
import { useLanguage } from '../context/LanguageContext';
import UnifiedModal from './layout/UnifiedModal';

const AuthModal = ({ isOpen, onClose, onLoginSuccess, initialMode = 'login', closeOnOverlayClick = true }) => {
    const { t, language } = useLanguage();
    const [isLogin, setIsLogin] = useState(initialMode === 'login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')



    // Reset mode when opening
    React.useEffect(() => {
        if (isOpen) {
            setIsLogin(initialMode === 'login');
            setMessage('');
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            let result
            if (isLogin) {
                // BACKUP LOCAL DATA BEFORE LOGIN
                // This allows us to restore the local state exactly as it was if the user logs out later.
                const currentHabits = localStorage.getItem('romehabits');
                if (currentHabits) {
                    localStorage.setItem('romehabits_backup', currentHabits);
                } else {
                    // Mark explicitly that there was no data
                    localStorage.setItem('romehabits_backup', 'null');
                }

                result = await signIn(email, password)
            } else {
                result = await signUp(email, password)
            }

            if (result.error) {
                setMessage(result.error.message)
            } else {
                // SUCCESS
                // Sync current local language to profile immediately to prevent overwrite by default 'en'
                if (result.data?.user) {
                    const { user } = result.data;
                    // Fire and forget update
                    import('../services/supabaseClient').then(({ supabase }) => {
                        supabase.from('profiles').update({ language }).eq('id', user.id).then(({ error }) => {
                            if (error) console.warn("Failed to sync language on auth:", error);
                        });
                    });
                }

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
        <UnifiedModal
            isOpen={isOpen}
            onClose={onClose}
            title={isLogin ? t('login_header') : t('register_header')}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #d4c5a3', fontSize: '1rem' }}
                    />
                    <input
                        type="password"
                        placeholder={t('password') || "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #d4c5a3', fontSize: '1rem' }}
                    />
                    <button type="submit" disabled={loading} className="btn full-width" style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                        {loading ? t('loading') : (isLogin ? t('login_btn') : t('register_btn'))}
                    </button>
                </form>

                {message && <p style={{
                    color: message.includes('error') ? '#c0392b' : '#27ae60',
                    background: 'rgba(255,255,255,0.5)',
                    padding: '10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>{message}</p>}

                <p style={{ marginTop: '5px', fontSize: '0.95em', textAlign: 'center', color: '#5d4037' }}>
                    {isLogin ? t('no_account') : t('has_account')}{' '}
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#8E1600',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: 'inherit'
                        }}
                    >
                        {isLogin ? t('register_link') : t('login_link')}
                    </button>
                </p>
            </div>
        </UnifiedModal>
    )
}

export default AuthModal
