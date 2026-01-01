import React from 'react';
import Icons from './Icons';

const SettingsModal = ({ onClose, onExport, onImport, useRomanNumerals, toggleRomanNumerals }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Systeembeheer</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>
                <div className="modal-body">
                    <div className="card" style={{ marginBottom: '15px' }}>
                        <h3><Icons.Scroll /> Kronieken Schrijven</h3>
                        <p>Exporteer je voortgang naar een bestand om het veilig te bewaren.</p>
                        <button className="btn" onClick={onExport} style={{ width: '100%', marginTop: '10px' }}>Schrijf Kronieken (Export)</button>
                    </div>
                    <div className="card">
                        <h3><Icons.Scroll /> Kronieken Lezen</h3>
                        <p>Herstel je voortgang vanuit een eerder bestand.</p>
                        <input type="file" accept=".json" onChange={(e) => { if (e.target.files[0]) onImport(e.target.files[0]); }} style={{ marginTop: '10px', width: '100%' }} />
                    </div>
                    <div className="card" style={{ marginTop: '15px' }}>
                        <h3><Icons.Scroll /> Weergave</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                            <span>Gebruik Romeinse Cijfers</span>
                            <input
                                type="checkbox"
                                checked={useRomanNumerals}
                                onChange={toggleRomanNumerals}
                                style={{ width: '20px', height: '20px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
