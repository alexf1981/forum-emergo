import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import Icons from './Icons';
import '../../css/components.css'; // Reuse basic styles or add specific admin CSS
import UnifiedModal from './layout/UnifiedModal';
import { useLanguage } from '../context/LanguageContext';
// Unified Components
import UnifiedButton from './common/UnifiedButton';
import UnifiedText from './common/UnifiedText';
import UnifiedInput from './common/UnifiedInput';

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
                {loading ? <UnifiedText>{t('admin_loading')}</UnifiedText> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ccc' }}>
                                    <th style={{ padding: '10px' }}><UnifiedText variant="caption" uppercase>{t('lbl_user')}</UnifiedText></th>
                                    <th style={{ padding: '10px' }}><UnifiedText variant="caption" uppercase>{t('lbl_email')}</UnifiedText></th>
                                    <th style={{ padding: '10px' }}><UnifiedText variant="caption" uppercase>{t('lbl_language')}</UnifiedText></th>
                                    <th style={{ padding: '10px' }}><UnifiedText variant="caption" uppercase>{t('gold')}</UnifiedText></th>
                                    <th style={{ padding: '10px' }}><UnifiedText variant="caption" uppercase>{t('lbl_last_seen')}</UnifiedText></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}><UnifiedText>{u.username}</UnifiedText></td>
                                        <td style={{ padding: '10px' }}><UnifiedText>{u.email}</UnifiedText></td>
                                        <td style={{ padding: '10px' }}>{renderLanguage(u.language)}</td>
                                        <td style={{ padding: '10px' }}><UnifiedText>{u.gold}</UnifiedText></td>
                                        <td style={{ padding: '10px' }}><UnifiedText variant="caption">{u.lastActive}</UnifiedText></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <UnifiedButton onClick={loadData}>{t('admin_refresh')}</UnifiedButton>
                </div>

                {/* CHEAT ACTIONS */}
                <div style={{ padding: '15px', borderTop: '1px solid #ddd', marginTop: '15px' }}>
                    <UnifiedText variant="h2" color="danger" style={{ fontSize: '1rem', marginTop: 0 }}>
                        ⚡ {t('admin_god_mode')}
                    </UnifiedText>

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

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <UnifiedButton
                            variant="danger"
                            onClick={() => {
                                if (window.confirm("Zeker weten? Alle gebouwen behalve Stadhuis worden gereset.")) { // TODO: Localize confirm
                                    if (actions && actions.adminResetCity) actions.adminResetCity();
                                    else alert("Action not found");
                                }
                            }}
                        >
                            🏚️ {t('admin_evacuate')}
                        </UnifiedButton>

                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <UnifiedInput
                                type="number"
                                placeholder={t('admin_enter_amount')}
                                id="adminGoldInput"
                                style={{ width: '120px' }}
                                containerStyle={{ marginBottom: 0 }}
                            />
                            <UnifiedButton
                                variant="primary"
                                onClick={() => {
                                    const val = document.getElementById('adminGoldInput').value;
                                    if (val && actions && actions.adminSetGold) actions.adminSetGold(val);
                                    else if (!val) alert("Vul een bedrag in");
                                    else alert("Action not found");
                                }}
                                style={{ backgroundColor: '#f1c40f', borderColor: '#d4ac0d', color: '#000' }}
                            >
                                💰 {t('admin_set_gold')}
                            </UnifiedButton>
                        </div>
                    </div>
                </div>
            </div>
        </UnifiedModal>
    );
};

export default AdminDashboard;
