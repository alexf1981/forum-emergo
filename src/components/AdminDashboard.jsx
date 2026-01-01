import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
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
        // Sort by score descending
        data.sort((a, b) => b.score - a.score);
        setUsers(data);
        setLoading(false);
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
                                        <th style={{ padding: '10px' }}>Score</th>
                                        <th style={{ padding: '10px' }}>Goud</th>
                                        <th style={{ padding: '10px' }}>Leger</th>
                                        <th style={{ padding: '10px' }}>Laatst Gezien</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{u.username}</td>
                                            <td style={{ padding: '10px' }}>{u.email}</td>
                                            <td style={{ padding: '10px' }}><strong>{u.score}</strong></td>
                                            <td style={{ padding: '10px' }}>{u.gold}</td>
                                            <td style={{ padding: '10px' }}>{u.army}</td>
                                            <td style={{ padding: '10px', fontSize: '0.8em' }}>{u.lastActive}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button className="pixel-btn secondary-btn mt-md" onClick={loadData}>Verversen</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
