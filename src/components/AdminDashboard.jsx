import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import Icons from './Icons';
import '../../css/components.css'; // Reuse basic styles or add specific admin CSS

const AdminDashboard = ({ onClose, actions }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(localStorage.getItem('CITY_EDIT_MODE') === 'true');

    useEffect(() => {
        loadData();
    }, []);

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
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h2>Keizerlijk Overzicht</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer', background: editMode ? '#fff' : 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '4px' }}>
                            <input
                                type="checkbox"
                                checked={editMode}
                                onChange={toggleEditMode}
                            />
                            Stad Bewerken
                        </label>
                    </div>
                    <button className="btn-icon" onClick={onClose}>X</button>
                </div>
                <div className="modal-body">
                    {loading ? <p>Gegevens ophalen uit het rijk...</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                                        <th style={{ padding: '10px' }}>Gebruiker</th>
                                        <th style={{ padding: '10px' }}>Email</th>
                                        <th style={{ padding: '10px' }}>Taal</th>
                                        <th style={{ padding: '10px' }}>Goud</th>
                                        <th style={{ padding: '10px' }}>Laatst Gezien</th>
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
                    <div className="modal-actions">
                        <button className="btn" onClick={loadData}>VERVERSEN</button>
                    </div>

                    {/* CHEAT ACTIONS */}
                    <div style={{ padding: '15px', borderTop: '1px solid #ddd', marginTop: '15px' }}>
                        <h3 style={{ marginTop: 0, color: '#e74c3c', fontSize: '1rem' }}>⚡ God Mode Actions</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="btn"
                                onClick={() => {
                                    if (window.confirm("Zeker weten? Alle gebouwen behalve Stadhuis worden gereset.")) {
                                        if (actions && actions.adminResetCity) actions.adminResetCity();
                                        else alert("Action not found");
                                    }
                                }}
                                style={{ backgroundColor: '#e74c3c', borderColor: '#c0392b' }}
                            >
                                🏚️ Stad Ontruimen
                            </button>

                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    placeholder="Goud hoeveelheid"
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
                                    💰 Zet Goud
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
