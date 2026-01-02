import React, { useState } from 'react';
import * as GameLogic from '../../logic/gameLogic';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Icons from '../Icons';
import HabitItem from '../HabitItem';

import CityVisual from '../CityVisual';

const CityView = ({ habits, stats, rank, score, onToggleHabit, onIncrementHabit, onDecrementHabit, onAddHabit, onDeleteHabit, onUpdateHabit, onNotify, formatNumber }) => {
    const { t } = useLanguage();
    const { playerName } = useAuth();
    const [editingHabitId, setEditingHabitId] = useState(null);

    const handleSaveEdit = (id, newText, newBucket) => {
        onUpdateHabit(id, newText, newBucket);
        setEditingHabitId(null);
    };

    return (
        <div className="city-dashboard">
            <div className="main-grid">
                <div className="city-visual-section card">
                    <CityVisual rank={rank} score={score} formatNumber={formatNumber} playerName={playerName} />
                </div>

                <main className="city-dashboard-content">
                    <div className="city-columns-container">
                        {['virtue', 'vice', 'todo'].map(colType => {
                            const colTitle = colType === 'virtue' ? 'Virtutes' : colType === 'vice' ? 'Barbaria' : 'Mandata';
                            const colColor = colType === 'virtue' ? '#4caf50' : colType === 'vice' ? '#ff4444' : '#2196f3';

                            return (
                                <div className="city-col" key={colType}>
                                    <div className="city-col-header" style={{ color: colColor, borderColor: colColor }}>{colTitle}</div>
                                    <div className="city-col-content">
                                        {(() => {
                                            const filteredHabits = habits.filter(h => (h.type || 'virtue') === colType);
                                            const today = GameLogic.getTodayString();

                                            // Split into active and completed (one-time only, for grouping)
                                            // Mandata (todo) are excluded from grouping as they delete automatically
                                            const activeHabits = [];
                                            const completedBucketHabits = [];

                                            filteredHabits.forEach(h => {
                                                const dailyCount = h.history.filter(d => d === today).length;
                                                const isDone = dailyCount > 0;

                                                if (colType !== 'todo' && h.bucket && isDone) {
                                                    completedBucketHabits.push(h);
                                                } else {
                                                    activeHabits.push(h);
                                                }
                                            });

                                            // Helper to render a list of habits
                                            const renderList = (list) => list.map(h => {
                                                const dailyCount = h.history.filter(d => d === today).length;
                                                const isDone = dailyCount > 0;

                                                if (editingHabitId === h.id) {
                                                    return (
                                                        <div key={h.id} className="habit-item compact editing" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                                            <input type="text" defaultValue={h.text} id={`edit-text-${h.id}`} style={{ width: '100%', padding: '4px', marginBottom: '4px' }} />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <label style={{ fontSize: '0.8rem' }}><input type="checkbox" defaultChecked={!h.bucket} id={`edit-bucket-${h.id}`} /> {t('recurring')}</label>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <button className="btn-icon" onClick={() => handleSaveEdit(h.id, document.getElementById(`edit-text-${h.id}`).value, !document.getElementById(`edit-bucket-${h.id}`).checked)}><Icons.Save /></button>
                                                                    <button className="btn-icon" onClick={() => setEditingHabitId(null)}><Icons.X /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <HabitItem
                                                        key={h.id}
                                                        habit={h}
                                                        colType={colType}
                                                        colColor={colColor}
                                                        isDone={isDone}
                                                        dailyCount={dailyCount}
                                                        onToggle={onToggleHabit}
                                                        onDelete={onDeleteHabit}
                                                        onEdit={setEditingHabitId}
                                                        onIncrement={onIncrementHabit}
                                                        onDecrement={onDecrementHabit}
                                                        onNotify={onNotify} // NEW
                                                        formatNumber={formatNumber}
                                                        t={t}
                                                    />
                                                );
                                            });

                                            return (
                                                <>
                                                    {renderList(activeHabits)}
                                                    {completedBucketHabits.length > 0 && (
                                                        <details style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '5px' }}>
                                                            <summary style={{ cursor: 'pointer', color: '#777', fontStyle: 'italic', marginBottom: '5px', userSelect: 'none' }}>
                                                                {t('completed_tasks')} ({completedBucketHabits.length})
                                                            </summary>
                                                            <div style={{ opacity: 0.7 }}>
                                                                {renderList(completedBucketHabits)}
                                                            </div>
                                                        </details>
                                                    )}
                                                </>
                                            );
                                        })()}
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
