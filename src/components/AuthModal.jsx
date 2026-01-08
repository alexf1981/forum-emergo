import React, { useState } from 'react'
import { signUp, signIn } from '../services/auth'
import '../../css/components.css'
import { useLanguage } from '../context/LanguageContext';
import UnifiedModal from './layout/UnifiedModal';
import UnifiedButton from './common/UnifiedButton';
import UnifiedInput from './common/UnifiedInput';
import UnifiedText from './common/UnifiedText';

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
                const currentHabits = localStorage.getItem('romehabits');
                if (currentHabits) {
                    localStorage.setItem('romehabits_backup', currentHabits);
                } else {
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
                if (result.data?.user) {
                    const { user } = result.data;
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
                    <UnifiedInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required // UnifiedInput should pass extra props down to input? Check implementation.
                        // Checked implementation: it doesn't spread ...props to input.
                        // I NEED TO UPDATE UnifiedInput TO SPREAD PROPS.
                        // Temporarily I rely on the existing props or update UnifiedInput.
                        // Looking at UnifiedInput: it doesn't spread `...rest`.
                        // I WILL FIX UnifiedInput in the next step or this one if parallel.
                        // Assuming I fix UnifiedInput to accept `required` and `...props`.
                        // For now I'll pass required via `...otherProps` if I fix it.
                        fullWidth
                    />
                    <UnifiedInput
                        type="password"
                        placeholder={t('password') || "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    <UnifiedButton
                        type="submit"
                        disabled={loading}
                        fullWidth
                        size="lg"
                    >
                        {loading ? t('loading') : (isLogin ? t('login_btn') : t('register_btn'))}
                    </UnifiedButton>
                </form>

                {message && (
                    <div style={{
                        color: message.includes('error') ? '#c0392b' : '#27ae60',
                        background: 'rgba(255,255,255,0.7)',
                        padding: '10px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        border: message.includes('error') ? '1px solid #c0392b' : '1px solid #27ae60'
                    }}>
                        <UnifiedText variant="caption" style={{ fontSize: '0.9rem', color: 'inherit', margin: 0 }}>
                            {message}
                        </UnifiedText>
                    </div>
                )}

                <div style={{ marginTop: '5px', textAlign: 'center' }}>
                    <UnifiedText variant="body" color="dark" style={{ display: 'inline', marginRight: '5px' }}>
                        {isLogin ? t('no_account') : t('has_account')}
                    </UnifiedText>
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
                            fontSize: '1rem',
                            fontFamily: 'Trajan Pro, serif',
                            textTransform: 'uppercase'
                        }}
                    >
                        {isLogin ? t('register_link') : t('login_link')}
                    </button>
                </div>
            </div>
        </UnifiedModal>
    )
}

export default AuthModal
