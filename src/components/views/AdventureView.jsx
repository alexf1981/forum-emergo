import React from 'react';
import * as GameLogic from '../../logic/gameLogic';

const AdventureView = ({ heroes, selectedQuest, onSelectQuest, onGoAdventure, onFightBoss, formatNumber }) => {
    return (
        <div>
            <h2>Campagne Kaart</h2>
            <div className="adventure-grid">
                <div className="card">
                    <h3>Missies</h3>
                    {GameLogic.QUESTS.map(q => (
                        <div key={q.id}
                            className={`quest-item ${selectedQuest === q.id ? 'selected' : ''}`}
                            onClick={() => onSelectQuest(q.id)}>
                            <h4>{q.name} (Lvl {formatNumber(q.level)})</h4>
                            <p>{q.desc}</p>
                            <small>Risico: {formatNumber(q.risk)} | Beloning: {formatNumber(q.reward)}g</small>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h3>Selecteer Held</h3>
                    {heroes.map(h => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderRadius: '4px', background: h.hp <= 5 ? '#fdd' : '#eee', marginBottom: '5px' }}>
                            <span>{h.name} (Str: {h.str})</span>
                            <button className="btn" disabled={h.hp <= 5 || !selectedQuest} onClick={() => onGoAdventure(h.id, selectedQuest)}>Stuur op pad</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="card" style={{ marginTop: '20px', borderColor: '#d32f2f' }}>
                <h3 style={{ color: '#d32f2f' }}>Eindbaas: De Hydra</h3>
                <p>Verzamel een sterk legioen om het beest te verslaan.</p>
                <button className="btn" style={{ background: '#d32f2f', color: 'white' }} onClick={onFightBoss}>VECHT TEGEN DE HYDRA</button>
            </div>
        </div>
    );
};

export default AdventureView;
