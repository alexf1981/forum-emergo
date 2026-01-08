import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import Icons from './Icons';
import '../../css/components.css'; // Reuse basic styles or add specific admin CSS
import UnifiedModal from './layout/UnifiedModal';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = ({ onClose, actions }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(localStorage.getItem('CITY_EDIT_MODE') === 'true');

    useEffect(() => {
        loadData();
    }, []);

    const { t } = useLanguage(); // Hook for translations

    const toggleEditMode = () => {
        const newValue = !editMode;
        setEditMode(newValue);
        localStorage.setItem('CITY_EDIT_MODE', newValue);
        // Dispatch custom event for immediate update in CapitalView
        window.dispatchEvent(new Event('city-edit-mode-change'));
    };

    const loadData = async () => {
        setLoading(true);
        const data = await AdminService.getAllUsersStats();
        // Sort by Gold descending since Score is hidden
        data.sort((a, b) => b.gold - a.gold);
        setUsers(data);
        setLoading(false);
    };

    const renderLanguage = (lang) => {
        switch (lang) {
            case 'nl': return <div title="Nederlands" style={{ display: 'flex', alignItems: 'center' }}><Icons.FlagNL /></div>;
            case 'en': return <div title="English" style={{ display: 'flex', alignItems: 'center' }}><Icons.FlagUK /></div>;
            case 'es': return <div title="Español" style={{ display: 'flex', alignItems: 'center' }}><Icons.FlagES /></div>;
            case 'de': return <div title="Deutsch" style={{ display: 'flex', alignItems: 'center' }}><Icons.FlagDE /></div>;
            default: return lang ? lang.toUpperCase() : '-';
        }
    };

    return (
        <UnifiedModal
            isOpen={true}
            onClose={onClose}
            title={t('admin_header')} // "Keizerrijk" / "Empire"
        >
            <div style={{ padding: '10px' }}>
                {loading ? <p>{t('admin_loading')}</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ccc' }}>
                                    <th style={{ padding: '10px' }}>{t('lbl_user')}</th>
                                    <th style={{ padding: '10px' }}>{t('lbl_email')}</th>
                                    <th style={{ padding: '10px' }}>{t('lbl_language')}</th>
                                    <th style={{ padding: '10px' }}>{t('gold')}</th>
                                    <th style={{ padding: '10px' }}>{t('lbl_last_seen')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{u.username}</td>
                                        <td style={{ padding: '10px' }}>{u.email}</td>
                                        <td style={{ padding: '10px' }}>{renderLanguage(u.language)}</td>
                                        <td style={{ padding: '10px' }}>{u.gold}</td>
                                        <td style={{ padding: '10px', fontSize: '0.8em' }}>{u.lastActive}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <button className="btn" onClick={loadData}>{t('admin_refresh')}</button>
                </div>

                {/* CHEAT ACTIONS */}
                <div style={{ padding: '15px', borderTop: '1px solid #ddd', marginTop: '15px' }}>
                    <h3 style={{ marginTop: 0, color: '#e74c3c', fontSize: '1rem' }}>⚡ {t('admin_god_mode')}</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer', background: editMode ? '#fff' : 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', color: '#000', fontWeight: 'bold', width: 'fit-content', border: '1px solid #ccc' }}>
                            <input
                                type="checkbox"
                                checked={editMode}
                                onChange={toggleEditMode}
                            />
                            {t('admin_edit_city')}
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            className="btn"
                            onClick={() => {
                                if (window.confirm("Zeker weten? Alle gebouwen behalve Stadhuis worden gereset.")) { // TODO: Localize confirm
                                    if (actions && actions.adminResetCity) actions.adminResetCity();
                                    else alert("Action not found");
                                }
                            }}
                            style={{ backgroundColor: '#e74c3c', borderColor: '#c0392b' }}
                        >
                            🏚️ {t('admin_evacuate')}
                        </button>

                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <input
                                type="number"
                                placeholder={t('admin_enter_amount')}
                                id="adminGoldInput"
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }}
                            />
                            <button
                                className="btn"
                                onClick={() => {
                                    const val = document.getElementById('adminGoldInput').value;
                                    if (val && actions && actions.adminSetGold) actions.adminSetGold(val);
                                    else if (!val) alert("Vul een bedrag in");
                                    else alert("Action not found");
                                }}
                                style={{ backgroundColor: '#f1c40f', borderColor: '#d4ac0d', color: '#000' }}
                            >
                                💰 {t('admin_set_gold')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </UnifiedModal>
    );
};

export default AdminDashboard;
