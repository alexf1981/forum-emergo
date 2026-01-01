import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import Icons from './Icons';
import '../../css/components.css'; // Reuse basic styles or add specific admin CSS

const AdminDashboard = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

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
                <div className="modal-header">
                    <h2>Keizerlijk Overzicht (Admin)</h2>
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
