import React, { useState } from 'react';
import Icons from './Icons';
import Flag from './layout/Flag';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/auth';
import AdminDashboard from './AdminDashboard';

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

// IMPORTS needed for Reset Logic
import { DataService } from '../services/dataService';
import * as GameLogic from '../logic/gameLogic';

const SettingsModal = ({ onClose, useRomanNumerals, toggleRomanNumerals, onLogin, onLocalLogout, actions }) => {
    const { user, playerName, updatePlayerName } = useAuth();
    const [localPlayerName, setLocalPlayerName] = useState(playerName || '');

    // Keep local input in sync if context updates (e.g. after async fetch)
    React.useEffect(() => {
        setLocalPlayerName(playerName || '');
    }, [playerName]);

    const { language, changeLanguage, t } = useLanguage();
    const [showAdmin, setShowAdmin] = useState(false);

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

        // 2. Capture Backup & Nuke Storage
        const backup = window.localStorage.getItem('romehabits_backup');
        window.localStorage.clear();

        // 3. Restore Backup (if exists)
        // If backup is 'null', we do nothing (storage stays empty, cleaner than restoring 'null')
        if (backup && backup !== 'null') {
            window.localStorage.setItem('romehabits', backup);
        }

        // CRITICAL CHANGE: Always force Welcome Screen after logout
        // Do NOT set 'has_visited' to true.
        // We ensure it is removed so the WelcomeModal appears.
        window.localStorage.removeItem('has_visited');

        // 4. Set a flag for the "just logged out" message (must be done AFTER clear)
        if (email) {
            window.localStorage.setItem('logout_message', `Uitgelogd als ${email}`);
        }

        // 4. Force reload
        window.location.reload();
    };

    const handleResetAccount = async () => {
        if (!window.confirm(t('msg_confirm_reset'))) return;

        // 1. Construct Default State
        // Habits: We must generate them here manually since we can't easily import "App's internal logic"
        // Using same keys as App.jsx seeding
        const now = Date.now();
        // Helper to generate 4 weeks of random history (strings)
        // MUST match HabitItem.jsx formatting (Local Time YYYY-MM-DD)
        const generateRandomHistory = () => {
            const history = [];
            const today = new Date();
            // Start from yesterday (i=1) to avoid overriding today's state
            for (let i = 1; i < 28; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);

                // Force Local Time Formatting to match HabitItem.jsx
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const dateStr = `${y}-${m}-${day}`;

                // 33% Done, 33% Fail (!), 33% No Data (Skip)
                const rand = Math.random();
                if (rand > 0.66) {
                    history.push(dateStr); // Green
                } else if (rand > 0.33) {
                    history.push(`!${dateStr}`); // Red
                }
                // else skip -> "No Data" (Grey)
            }
            return history;
        };

        const defaultHabits = [
            { id: now + 1, text: t('habit_walk_10k'), type: 'virtue', completed: false, history: generateRandomHistory(), recurring: false },
            { id: now + 3, text: t('habit_hobby'), type: 'virtue', completed: false, history: [], recurring: true },
            { id: now + 4, text: t('habit_sleep_late'), type: 'vice', completed: false, history: [], recurring: false },
            { id: now + 5, text: t('habit_smoke'), type: 'vice', completed: false, history: [], recurring: true },
            { id: now + 7, text: t('habit_taxes'), type: 'todo', completed: false, history: [], recurring: false }
        ];

        const resetData = {
            romestats: { gold: 200, know: 0, pop: 100 },
            romeheroes: [],
            romehabits: defaultHabits,
            romebuildings: GameLogic.INITIAL_BUILDINGS,
            romeresources: {},
            romeresearch: {},
            romeloginhistory: [],
            romelastwelcome: ''
        };

        if (user) {
            // Logged In: Overwrite Cloud Data
            try {
                await DataService.saveGameData(user.id, resetData);
                // Also overwrite local storage to ensure immediate consistency before reload
                window.localStorage.setItem('romestats', JSON.stringify(resetData.romestats));
                window.localStorage.setItem('romeheroes', JSON.stringify(resetData.romeheroes));
                window.localStorage.setItem('romehabits', JSON.stringify(resetData.romehabits));
                window.localStorage.setItem('romebuildings', JSON.stringify(resetData.romebuildings));
                window.localStorage.setItem('romeresources', JSON.stringify(resetData.romeresources));
                window.localStorage.setItem('romeresearch', JSON.stringify(resetData.romeresearch));
                window.localStorage.setItem('romeloginhistory', JSON.stringify(resetData.romeloginhistory));

                // Set flag to trigger onboarding after reload
                window.localStorage.setItem('trigger_onboarding', 'true');

                // Reload to refresh game state completely
                window.location.reload();
            } catch (error) {
                console.error("Reset Failed:", error);
                alert("Reset failed: " + error.message);
            }
        } else {
            // Local: Clear and Reload (triggering Welcome)
            window.localStorage.clear();
            // We specifically want to trigger Welcome Modal, so ensure has_visited is GONE.
            // But wait! If we clear(), it IS gone.
            // AND we want default habits? 
            // If we clear and reload, App.jsx `onPlayLocal` logic (via WelcomeModal) handles the seeding.
            // So for local user, just clearing and reloading is enough to "Start Over".
            // Prompt says: "standaardtaken worden weer toegevoegd".
            // App.jsx logic: if habits.length === 0, seed defaults.
            // So simply clearing storage works.

            // Set flag to trigger onboarding after reload
            // REMOVED: For local user, we want the "Welcome Modal" to take precedence. 
            // The Welcome Modal -> "Play Local" flow will naturally trigger onboarding.
            // window.localStorage.setItem('trigger_onboarding', 'true');

            window.location.reload();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('settings_title')}</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>
                <div className="modal-body" style={{ gap: '8px', padding: '0 5px' }}>

                    {/* PLAYER & LOGIN STATUS COMBINED */}
                    <div className="card" style={{ padding: '10px' }}>
                        <div className="modal-form-group" style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.85em', color: '#666' }}>{t('player_name')}</label>
                            <input
                                type="text"
                                value={localPlayerName}
                                onChange={(e) => setLocalPlayerName(e.target.value)}
                                onBlur={() => updatePlayerName(localPlayerName)}
                                placeholder={t('player_name')}
                                style={{ padding: '6px' }}
                            />
                        </div>

                        {user ? (
                            <div className="mt-sm" style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                <p style={{ fontSize: '0.85em', margin: '0 0 5px 0' }}>{t('cloud_desc_user')} <strong>{user.email}</strong></p>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {isAdmin && (
                                        <button className="btn" onClick={() => setShowAdmin(true)} style={{ flex: 1, backgroundColor: '#8e44ad', borderColor: '#6c3483', padding: '6px', fontSize: '0.9em' }}>
                                            <Icons.Crown /> Admin
                                        </button>
                                    )}
                                    <button className="btn" onClick={handleLogout} style={{ flex: 1, backgroundColor: '#c0392b', borderColor: '#962d22', padding: '6px', fontSize: '0.9em' }}>{t('logout')}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-sm" style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                <p style={{ fontSize: '0.85em', margin: '0 0 5px 0' }}>
                                    {t('logged_in_as')}: <strong>{t('local_login_status')}</strong>
                                </p>
                                <div style={{
                                    backgroundColor: '#fff3cd',
                                    border: '1px solid #ffeeba',
                                    color: '#856404',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    fontSize: '0.75em',
                                    margin: '5px 0',
                                    lineHeight: '1.3'
                                }}>
                                    <Icons.CloudOffline style={{ marginRight: '4px', width: '12px', height: '12px', verticalAlign: 'middle' }} />
                                    {t('welcome_local_desc')}
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button className="btn" onClick={onLogin} style={{ flex: 2, padding: '6px', fontSize: '0.9em' }}>{t('login_btn')} / {t('register_btn')}</button>
                                    <button
                                        className="btn"
                                        onClick={onLocalLogout}
                                        style={{ flex: 1, backgroundColor: '#7f8c8d', borderColor: '#666', padding: '6px', fontSize: '0.9em' }}
                                    >
                                        {t('logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DISPLAY SETTINGS */}
                    <div className="card" style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.9em' }}>{t('lbl_language')}</span>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {['en', 'nl', 'es', 'de'].map(langKey => (
                                    <button
                                        key={langKey}
                                        onClick={() => changeLanguage(langKey)}
                                        style={{
                                            padding: '0',
                                            width: '28px',
                                            height: '28px',
                                            border: language === langKey ? '2px solid #8E1600' : '1px solid #ccc',
                                            borderRadius: '50%',
                                            backgroundColor: language === langKey ? '#fff0e0' : 'white',
                                            cursor: 'pointer',
                                            opacity: language === langKey ? 1 : 0.6,
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

                        <div className="settings-row" style={{ marginTop: '5px', padding: '5px 0', borderTop: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: '0.9em' }}>{t('roman_nums')}</span>
                            <input
                                type="checkbox"
                                checked={useRomanNumerals}
                                onChange={toggleRomanNumerals}
                                className="settings-checkbox"
                                style={{ transform: 'scale(0.9)' }}
                            />
                        </div>
                    </div>

                    {/* RESET ACCOUNT SECTION - Minimal */}
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={handleResetAccount}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#c0392b',
                                fontSize: '0.8em',
                                cursor: 'pointer',
                                opacity: 0.7,
                                textDecoration: 'underline',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Icons.Trash style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                            {t('reset_account_btn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
