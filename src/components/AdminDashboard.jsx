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
import UnifiedCard from './common/UnifiedCard';

const AdminDashboard = ({ onClose, actions }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(localStorage.getItem('CITY_EDIT_MODE') === 'true');
    const [expandedId, setExpandedId] = useState(null);

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
                {/* CHEAT ACTIONS */}
                <div style={{ padding: '15px', borderBottom: '1px solid #ddd', marginBottom: '15px' }}>
                    <UnifiedText variant="h2" color="danger" style={{ fontSize: '1rem', marginTop: 0 }}>
                        ⚡ {t('admin_god_mode')}
                    </UnifiedText>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* 1. Next Day */}
                        <UnifiedButton
                            onClick={() => {
                                if (actions && actions.adminSimulateNewDay) {
                                    onClose();
                                    setTimeout(() => actions.adminSimulateNewDay(), 50);
                                } else {
                                    alert("Action not found");
                                }
                            }}
                            variant="primary"
                            title="Simulate New Day"
                            style={{ width: 'fit-content' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icons.Sun /> {t('btn_next_day')}
                            </div>
                        </UnifiedButton>

                        {/* 2. Set Gold */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <UnifiedButton
                                variant="primary"
                                onClick={() => {
                                    const input = document.getElementById('adminGoldInput');
                                    const val = input ? input.value : null;
                                    if (val && actions && actions.adminSetGold) {
                                        actions.adminSetGold(val);
                                        input.value = ''; // Clear input
                                    }
                                    else if (!val) alert(t('admin_enter_amount'));
                                    else alert("Action not found");
                                }}
                                style={{ backgroundColor: '#f1c40f', borderColor: '#d4ac0d', color: '#000' }}
                            >
                                💰 {t('admin_set_gold')}
                            </UnifiedButton>
                            <UnifiedInput
                                type="number"
                                placeholder={t('admin_enter_amount')}
                                id="adminGoldInput"
                                style={{ width: '120px' }}
                                containerStyle={{ marginBottom: 0 }}
                            />
                        </div>

                        {/* 3. Reset City */}
                        <UnifiedButton
                            variant="danger"
                            onClick={() => {
                                if (window.confirm("Zeker weten? Alle gebouwen behalve Stadhuis worden gereset.")) {
                                    if (actions && actions.adminResetCity) actions.adminResetCity();
                                    else alert("Action not found");
                                }
                            }}
                            style={{ width: 'fit-content' }}
                        >
                            🏚️ {t('admin_evacuate')}
                        </UnifiedButton>

                        {/* 4. Edit Mode Toggle */}
                        <UnifiedButton
                            variant={editMode ? "success" : "danger"}
                            onClick={toggleEditMode}
                            style={{ width: 'fit-content' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {editMode ? <Icons.Unlock /> : <Icons.Lock />}
                                {editMode ? t('admin_edit_active') : t('admin_locked')}
                            </div>
                        </UnifiedButton>
                    </div>
                </div>

                {loading ? <UnifiedText>{t('admin_loading')}</UnifiedText> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {users.map(u => (
                            <UnifiedCard key={u.id} padding="10px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backgroundImage: 'none', border: '1px solid #ccc' }}>
                                {/* Header */}
                                <div
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                    onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <UnifiedText style={{ fontWeight: 'bold' }}>{u.email}</UnifiedText>
                                        <UnifiedText variant="caption">{t('lbl_last_seen')}: {u.lastActive}</UnifiedText>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', color: '#8E1600' }}>
                                        <Icons.Menu />
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === u.id && (
                                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #d4c5a3', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                            <div><strong>{t('lbl_user')}:</strong> {u.username}</div>
                                            <div><strong>{t('lbl_created')}:</strong> {u.createdAt}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <strong>{t('lbl_language')}:</strong> {renderLanguage(u.language)}
                                            </div>
                                            <div><strong>{t('gold')}:</strong> {u.gold}</div>
                                            <div><strong>Heroes:</strong> {u.heroes.length}</div>
                                        </div>

                                        {/* Buildings */}
                                        <div style={{ marginTop: '10px' }}>
                                            <UnifiedText variant="caption" style={{ fontWeight: 'bold' }}>Buildings</UnifiedText>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', fontSize: '0.8rem' }}>
                                                {u.buildings && u.buildings.length > 0 ? u.buildings.map(b => (
                                                    <span key={b.id} style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                                        {b.id}: {b.level}
                                                    </span>
                                                )) : <span>-</span>}
                                            </div>
                                        </div>

                                        {/* Research */}
                                        <div style={{ marginTop: '10px' }}>
                                            <UnifiedText variant="caption" style={{ fontWeight: 'bold' }}>Research</UnifiedText>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', fontSize: '0.8rem' }}>
                                                {u.research && Object.keys(u.research).length > 0 ? Object.entries(u.research).map(([key, val]) => (
                                                    <span key={key} style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                                        {key}: {typeof val === 'object' ? val.level : val}
                                                    </span>
                                                )) : <span>-</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </UnifiedCard>
                        ))}
                    </div>
                )}
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <UnifiedButton onClick={loadData}>{t('admin_refresh')}</UnifiedButton>
                </div>


            </div>
        </UnifiedModal>
    );
};

export default AdminDashboard;
