import React, { useState } from 'react';
import Icons from './Icons';
import Flag from './layout/Flag';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/auth';
import AdminDashboard from './AdminDashboard';

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const SettingsModal = ({ onClose, onExport, onImport, useRomanNumerals, toggleRomanNumerals, onLogin, actions }) => {
    const { user, playerName, updatePlayerName } = useAuth();
    const [localPlayerName, setLocalPlayerName] = useState(playerName || '');

    // Keep local input in sync if context updates (e.g. after async fetch)
    React.useEffect(() => {
        setLocalPlayerName(playerName || '');
    }, [playerName]);

    const { language, changeLanguage, t } = useLanguage();
    const [showAdmin, setShowAdmin] = useState(false);
    const [showLocal, setShowLocal] = useState(false); // Collapsed by default to save space

    // Simple admin check
    const ADMINS = ['alexfitie1981@gmail.com', 'olivierfitie2015@gmail.com'];
    const isAdmin = user?.email && ADMINS.includes(user.email);

    if (showAdmin) {
        return <AdminDashboard onClose={() => setShowAdmin(false)} actions={actions} />;
    }

    const handleLogout = async () => {
        const email = user?.email; // Capture email before it's gone

        // 1. Attempt to sign out (server/client) with timeout safety
        try {
            const logoutPromise = signOut();
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.race([logoutPromise, timeoutPromise]);
        } catch (error) {
            console.error("Logout error (or timeout):", error);
        }

        // 2. Nuke everything from storage to be sure (Auth tokens + Game Data)
        window.localStorage.clear();

        // 3. Set a flag for the "just logged out" message (must be done AFTER clear)
        if (email) {
            window.localStorage.setItem('logout_message', `Uitgelogd als ${email}`);
        }

        // 4. Force reload
        window.location.reload();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('settings_title')}</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>
                <div className="modal-body" style={{ gap: '10px' }}>


                    {/* PROFILE SECTION */}
                    <div className="card">
                        <div className="modal-form-group">
                            <label>{t('player_name')}</label>
                            <input
                                type="text"
                                value={localPlayerName}
                                onChange={(e) => setLocalPlayerName(e.target.value)}
                                onBlur={() => updatePlayerName(localPlayerName)}
                                placeholder={t('player_name')}
                            />
                        </div>
                    </div>

                    {/* CLOUD SECTION (Preferred) */}
                    <div className="card">
                        <h3><Icons.Wreath /> {t('cloud_storage')}</h3>
                        {user ? (
                            <div className="mt-sm">
                                <p style={{ fontSize: '0.9em' }}>{t('cloud_desc_user')} <br /><strong>{user.email}</strong></p>
                                {isAdmin && (
                                    <button className="btn full-width mt-sm" onClick={() => setShowAdmin(true)} style={{ backgroundColor: '#8e44ad', borderColor: '#6c3483' }}>
                                        <Icons.Crown /> Admin
                                    </button>
                                )}
                                <button className="btn full-width mt-sm" onClick={handleLogout} style={{ backgroundColor: '#c0392b', borderColor: '#962d22' }}>{t('logout')}</button>
                            </div>
                        ) : (
                            <div className="mt-sm">
                                <p style={{ fontSize: '0.9em' }}>{t('cloud_desc_guest')}</p>
                                <button className="btn full-width mt-sm" onClick={onLogin}>{t('login_btn')} / {t('register_btn')}</button>
                            </div>
                        )}
                    </div>

                    {/* DISPLAY SETTINGS */}
                    <div className="card" style={{ padding: '10px' }}>
                        <div className="settings-row" style={{ marginBottom: '10px', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ marginBottom: '5px' }}>{t('lbl_language')}</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['en', 'nl', 'es', 'de'].map(langKey => (
                                    <button
                                        key={langKey}
                                        onClick={() => changeLanguage(langKey)}
                                        style={{
                                            fontSize: '1.5rem',
                                            padding: '0',
                                            width: '40px',
                                            height: '40px',
                                            border: language === langKey ? '2px solid #8E1600' : '1px solid #ccc',
                                            borderRadius: '50%',
                                            backgroundColor: language === langKey ? '#fff0e0' : 'white',
                                            cursor: 'pointer',
                                            opacity: language === langKey ? 1 : 0.7,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}
                                        title={translations[langKey].name}
                                    >
                                        <Flag code={langKey} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="settings-row">
                            <span>{t('roman_nums')}</span>
                            <input
                                type="checkbox"
                                checked={useRomanNumerals}
                                onChange={toggleRomanNumerals}
                                className="settings-checkbox"
                            />
                        </div>



                    </div>

                    {/* LOCAL SECTION (Collapsible) */}
                    <div className="card" style={{ padding: '10px' }}>
                        <div
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setShowLocal(!showLocal)}
                        >
                            <h3 style={{ margin: 0, fontSize: '1rem' }}><Icons.Scroll /> {t('local_manage')}</h3>
                            <span>{showLocal ? '▲' : '▼'}</span>
                        </div>

                        {showLocal && (
                            <div className="mt-md">
                                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
                                    {t('local_desc')}
                                </p>
                                <button className="btn full-width" onClick={onExport} style={{ fontSize: '0.9em', padding: '8px' }}>
                                    <Icons.Save /> {t('download_backup')}
                                </button>
                                <div className="mt-sm">
                                    <label style={{ fontSize: '0.9em', display: 'block', marginBottom: '4px' }}>{t('restore_backup')}:</label>
                                    <input
                                        className="file-input full-width"
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => { if (e.target.files[0]) onImport(e.target.files[0]); }}
                                        style={{ fontSize: '0.8em' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
