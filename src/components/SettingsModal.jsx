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
                    <div className="card mb-md">
                        <h3><Icons.Scroll /> Kronieken Schrijven</h3>
                        <p>Exporteer je voortgang naar een bestand om het veilig te bewaren.</p>
                        <button className="btn full-width mt-sm" onClick={onExport}>Schrijf Kronieken (Export)</button>
                    </div>
                    <div className="card">
                        <h3><Icons.Scroll /> Kronieken Lezen</h3>
                        <p>Herstel je voortgang vanuit een eerder bestand.</p>
                        <input className="file-input mt-sm full-width" type="file" accept=".json" onChange={(e) => { if (e.target.files[0]) onImport(e.target.files[0]); }} />
                    </div>
                    <div className="card mt-md">
                        <h3><Icons.Scroll /> Weergave</h3>
                        <div className="settings-row mt-sm">
                            <span>Gebruik Romeinse Cijfers</span>
                            <input
                                type="checkbox"
                                checked={useRomanNumerals}
                                onChange={toggleRomanNumerals}
                                className="settings-checkbox"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
