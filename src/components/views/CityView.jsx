import React, { useState } from 'react';
import * as GameLogic from '../../logic/gameLogic';
import { useLanguage } from '../../context/LanguageContext';
import Icons from '../Icons';

const CityVisual = ({ rank }) => {
    const { t } = useLanguage();

    // Rank logic for image
    let image = 'assets/city_village.png'; // default
    if (rank === 'rank_1' || rank === 'rank_2') {
        image = 'assets/city_town.png';
    } else if (rank === 'rank_3' || rank === 'rank_4') {
        image = 'assets/city_capital.png';
    }

    return (
        <div style={{
            textAlign: 'center',
            padding: '0',
            background: 'transparent',
            marginBottom: '1rem',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #ccc'
        }}>
            <img src={image} style={{ width: '100%', display: 'block' }} alt="City Status" />
            <div style={{
                backgroundColor: '#f0f0f0',
                padding: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: '#555',
                borderTop: '1px solid #ccc'
            }}>
                {t(rank)}
            </div>
        </div>
    );
};

const CityView = ({ habits, stats, rank, score, onToggleHabit, onIncrementHabit, onAddHabit, onDeleteHabit, onUpdateHabit, formatNumber }) => {
    const { t } = useLanguage();
    const [editingHabitId, setEditingHabitId] = useState(null);

    const handleSaveEdit = (id, newText, newBucket) => {
        onUpdateHabit(id, newText, newBucket);
        setEditingHabitId(null);
    };

    return (
        <div className="city-dashboard">
            <div className="main-grid">
                <aside>
                    <div className="card">
                        <div className="card-title"><h3>{t('nav_city')}</h3></div>
                        <CityVisual rank={rank} score={score} formatNumber={formatNumber} />
                        <div className="stat-row"><span className="resource gold"><Icons.Coin /> {t('gold')}</span><span>{formatNumber(stats.gold)}</span></div>
                        <div className="stat-row"><span className="resource army"><Icons.Sword /> {t('score')}</span><span>{formatNumber(stats.army)}</span></div>
                    </div>
                </aside>

                <main className="city-dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', flexGrow: 1 }}>
                    <div className="city-columns-container">
                        {['virtue', 'vice', 'todo'].map(colType => {
                            const colTitle = colType === 'virtue' ? 'Virtutes' : colType === 'vice' ? 'Barbaria' : 'Mandata';
                            const colColor = colType === 'virtue' ? '#4caf50' : colType === 'vice' ? '#ff4444' : '#2196f3';

                            return (
                                <div className="city-col" key={colType}>
                                    <div className="city-col-header" style={{ color: colColor, borderColor: colColor }}>{colTitle}</div>
                                    <div className="city-col-content">
                                        {habits.filter(h => (h.type || 'virtue') === colType).sort((a, b) => {
                                            const today = GameLogic.getTodayString();
                                            const aDone = a.history.includes(today);
                                            const bDone = b.history.includes(today);
                                            if (a.bucket && aDone && (!b.bucket || !bDone)) return 1;
                                            if (b.bucket && bDone && (!a.bucket || !aDone)) return -1;
                                            return 0;
                                        }).map(h => {
                                            const today = GameLogic.getTodayString();
                                            const dailyCount = h.history.filter(d => d === today).length;
                                            const isDone = dailyCount > 0;
                                            const isDoneOneTime = h.bucket && isDone;

                                            if (editingHabitId === h.id) {
                                                return (
                                                    <div key={h.id} className="habit-item compact editing" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                                        <input type="text" defaultValue={h.text} id={`edit-text-${h.id}`} style={{ width: '100%', padding: '4px', marginBottom: '4px' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <label style={{ fontSize: '0.8rem' }}><input type="checkbox" defaultChecked={h.bucket} id={`edit-bucket-${h.id}`} /> {t('habit_new')}</label>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button className="btn-icon" onClick={() => handleSaveEdit(h.id, document.getElementById(`edit-text-${h.id}`).value, document.getElementById(`edit-bucket-${h.id}`).checked)}><Icons.Save /></button>
                                                                <button className="btn-icon" onClick={() => setEditingHabitId(null)}><Icons.X /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={h.id} className={`habit-item compact ${isDoneOneTime ? 'completed' : ''}`}
                                                    style={{ borderLeft: `3px solid ${colColor}`, opacity: isDoneOneTime ? 0.5 : 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                                        <div className={`habit-checkbox compact ${isDone ? 'checked' : ''}`} style={{ borderColor: colColor }} onClick={() => onToggleHabit(h.id)}>
                                                            {isDone && (colType === 'vice' ? <span style={{ color: colColor, fontWeight: 'bold' }}>X</span> : <Icons.Check style={{ width: 14, height: 14 }} />)}
                                                        </div>
                                                        <span className="habit-text" style={isDone && colType === 'todo' ? { textDecoration: 'line-through', color: '#888' } : {}}>
                                                            {h.text}
                                                            {!h.bucket && dailyCount > 1 && <span style={{ marginLeft: '4px', color: 'var(--color-gold)', fontWeight: 'bold' }}>x{formatNumber(dailyCount)}</span>}
                                                            {colType === 'vice' && dailyCount > 0 && <span style={{ marginLeft: '4px', color: '#ff4444', fontWeight: 'bold' }}>(-20g)</span>}
                                                        </span>
                                                    </div>

                                                    <div className="habit-controls" style={{ display: 'flex', gap: '2px' }}>
                                                        <button className="btn-icon small" onClick={() => setEditingHabitId(h.id)} title={t('save')}><Icons.Edit /></button>
                                                        <button className="btn-icon small" onClick={() => onDeleteHabit(h.id)} title={t('habit_delete_confirm')}><Icons.Trash /></button>
                                                        {!h.bucket && (
                                                            <button className="btn-icon" style={{ borderColor: colColor, color: colColor, marginLeft: '4px' }} onClick={(e) => onIncrementHabit(h.id, e)}>+</button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CityView;
