import React, { useState } from 'react';
import Icons from './Icons';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/auth';
import AdminDashboard from './AdminDashboard';

const SettingsModal = ({ onClose, onExport, onImport, useRomanNumerals, toggleRomanNumerals, onLogin }) => {
    const { user } = useAuth();
    const [showAdmin, setShowAdmin] = useState(false);
    const [showLocal, setShowLocal] = useState(false); // Collapsed by default to save space

    // Simple admin check
    const isAdmin = user?.email === 'alexfitie1981@gmail.com';

    if (showAdmin) {
        return <AdminDashboard onClose={() => setShowAdmin(false)} />;
    }

    const handleLogout = async () => {
        const email = user?.email; // Capture email before it's gone

        // 1. Attempt to sign out (server/client)
        try {
            await signOut();
        } catch (error) {
            console.error("Logout error:", error);
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
                    <h2>Instellingen</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>
                <div className="modal-body" style={{ gap: '10px' }}>

                    {/* CLOUD SECTION (Preferred) */}
                    <div className="card">
                        <h3><Icons.Wreath /> Cloud Opslag</h3>
                        {user ? (
                            <div className="mt-sm">
                                <p style={{ fontSize: '0.9em' }}>Ingelogd als: <br /><strong>{user.email}</strong></p>
                                {isAdmin && (
                                    <button className="btn full-width mt-sm" onClick={() => setShowAdmin(true)} style={{ backgroundColor: '#8e44ad', borderColor: '#6c3483' }}>
                                        <Icons.Crown /> Admin
                                    </button>
                                )}
                                <button className="btn full-width mt-sm" onClick={handleLogout} style={{ backgroundColor: '#c0392b', borderColor: '#962d22' }}>Uitloggen</button>
                            </div>
                        ) : (
                            <div className="mt-sm">
                                <p style={{ fontSize: '0.9em' }}>Maak een account aan om je voortgang veilig in de cloud te bewaren en overal te spelen.</p>
                                <button className="btn full-width mt-sm" onClick={onLogin}>Inloggen / Registreren</button>
                            </div>
                        )}
                    </div>

                    {/* DISPLAY SETTINGS */}
                    <div className="card" style={{ padding: '10px' }}>
                        <div className="settings-row">
                            <span>Romeinse Cijfers</span>
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
                            <h3 style={{ margin: 0, fontSize: '1rem' }}><Icons.Scroll /> Lokaal Beheer</h3>
                            <span>{showLocal ? '▲' : '▼'}</span>
                        </div>

                        {showLocal && (
                            <div className="mt-md">
                                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
                                    Geen account nodig. Gegevens worden op dit apparaat opgeslagen. je kunt ook handmatig back-ups maken.
                                </p>
                                <button className="btn full-width" onClick={onExport} style={{ fontSize: '0.9em', padding: '8px' }}>
                                    <Icons.Save /> Download Backup
                                </button>
                                <div className="mt-sm">
                                    <label style={{ fontSize: '0.9em', display: 'block', marginBottom: '4px' }}>Backup Terugzetten:</label>
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
