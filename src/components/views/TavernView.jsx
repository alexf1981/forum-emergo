import React from 'react';

const TavernView = ({ heroes, onRecruit, onHeal, gold }) => {
    return (
        <div>
            <div className="tavern-bg">
                <h2>De Vergulde Gladius</h2>
                <p>Recruteer helden voor je legioen</p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <button className="btn" onClick={onRecruit}>Nieuwe Held Rekruteren (100g)</button>
                </div>
                <div className="heroes-grid" style={{ marginTop: '20px' }}>
                    {heroes.map(h => (
                        <div key={h.id} className="card hero-card">
                            <div className="card-title">{h.name} <span style={{ fontSize: '0.8em', color: '#aaa' }}>Lvl {h.lvl}</span></div>
                            <div>XP: {h.xp} / {h.lvl * 100}</div>
                            <div>HP: {h.hp} / {h.maxHp}</div>
                            <div>Kracht: {h.str}</div>
                            {h.hp < h.maxHp && <button className="btn-icon" onClick={() => onHeal(h.id)}>❤️ Genees (10g)</button>}
                            {h.items.length > 0 && (
                                <div className="inventory">
                                    {h.items.map((i, idx) => <span key={idx} title={`${i.name} (+${i.bonus})`}>{i.icon}</span>)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TavernView;
