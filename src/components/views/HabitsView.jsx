import React, { useState } from 'react';
import * as GameLogic from '../../logic/gameLogic';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Icons from '../Icons';
import HabitItem from '../HabitItem';
import CityVisual from '../CityVisual';
import '../../css/habits.css';

// Unified Components
import UnifiedCard from '../common/UnifiedCard';
import UnifiedText from '../common/UnifiedText';
import UnifiedButton from '../common/UnifiedButton';

const HabitsView = ({ habits, stats, buildings, rank, score, onToggleHabit, onIncrementHabit, onDecrementHabit, onAddHabit, onDeleteHabit, onUpdateHabit, onMoveHabit, onNotify, formatNumber, loginHistory, onSetHabitCompletion }) => {
    const { t } = useLanguage();
    const { playerName } = useAuth();
    const [editingHabitId, setEditingHabitId] = useState(null);

    // Calculate Population for Image
    const population = buildings ? GameLogic.getCityPopulation(buildings) : 0;

    const handleSaveEdit = (id, newText, newBucket) => {
        onUpdateHabit(id, newText, newBucket);
        setEditingHabitId(null);
    };

    // Drag and Drop Logic
    const [draggedHabitId, setDraggedHabitId] = useState(null);
    const [dragOverHabitId, setDragOverHabitId] = useState(null);
    const [dragOverPos, setDragOverPos] = useState(null);

    // Immediate Reward Logic: Pending Completion State
    const [pendingIds, setPendingIds] = useState(new Set());

    const handlePending = (id, isPending) => {
        setPendingIds(prev => {
            const newSet = new Set(prev);
            if (isPending) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleDragStart = (e, id) => {
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => setDraggedHabitId(id), 0);
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedHabitId !== id) {
            setDragOverHabitId(id);
            const rect = e.currentTarget.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
                setDragOverPos('above');
            } else {
                setDragOverPos('below');
            }
        }
    };

    const handleDragEnd = () => {
        setDraggedHabitId(null);
        setDragOverHabitId(null);
        setDragOverPos(null);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedHabitId && targetId && draggedHabitId !== targetId) {
            onMoveHabit(draggedHabitId, targetId, dragOverPos);
        }
        setDraggedHabitId(null);
        setDragOverHabitId(null);
        setDragOverPos(null);
    };

    return (
        <div className="city-dashboard">

            <div className="habits-grid-wrapper-outer">
                <div className="habits-grid-wrapper-inner">
                    {['virtue', 'vice', 'todo'].map(colType => {
                        const colTitle = colType === 'virtue' ? 'Virtutes' : colType === 'vice' ? 'Barbaria' : 'Mandata';
                        const colColor = colType === 'virtue' ? '#27ae60' : colType === 'vice' ? '#c0392b' : '#2980b9'; // Adjusted to match unified palettes slightly

                        return (
                            <div className="city-col" key={colType} id={`city-col-${colType}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Column Header */}
                                <div style={{
                                    borderBottom: `3px solid ${colColor}`,
                                    paddingBottom: '5px',
                                    marginBottom: '5px',
                                    textAlign: 'center'
                                }}>
                                    <UnifiedText
                                        variant="h2"
                                        style={{ color: colColor, fontSize: '1.4rem', letterSpacing: '2px', margin: 0 }}
                                    >
                                        {colTitle}
                                    </UnifiedText>
                                </div>

                                <div className="city-col-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {(() => {
                                        const filteredHabits = habits.filter(h => (h.type || 'virtue') === colType);
                                        const today = GameLogic.getTodayString();
                                        const activeHabits = [];
                                        const completedBucketHabits = [];

                                        filteredHabits.forEach(h => {
                                            const dailyCount = h.history.filter(d => d === today).length;
                                            const isDone = dailyCount > 0;
                                            const isRecurring = h.recurring !== undefined ? h.recurring : !h.bucket;
                                            const isOneTime = !isRecurring;

                                            if ((h.bucket || isOneTime) && isDone && !pendingIds.has(h.id)) {
                                                completedBucketHabits.push(h);
                                            } else {
                                                activeHabits.push(h);
                                            }
                                        });

                                        const renderList = (list, isDraggable = false) => {
                                            return list.map((h, index) => {
                                                const dailyCount = h.history.filter(d => d === today).length;
                                                const isDone = dailyCount > 0;

                                                if (editingHabitId === h.id) {
                                                    return (
                                                        <UnifiedCard key={h.id} variant="glass" padding="10px">
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <input type="text" defaultValue={h.text} id={`edit-text-${h.id}`} style={{ width: '100%', padding: '8px', marginBottom: '4px' }} />
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <label style={{ fontSize: '0.8rem' }}><input type="checkbox" defaultChecked={!h.bucket} id={`edit-bucket-${h.id}`} /> {t('recurring')}</label>
                                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                                        <UnifiedButton size="sm" variant="success" onClick={() => handleSaveEdit(h.id, document.getElementById(`edit-text-${h.id}`).value, !document.getElementById(`edit-bucket-${h.id}`).checked)}><Icons.Save /></UnifiedButton>
                                                                        <UnifiedButton size="sm" variant="danger" onClick={() => setEditingHabitId(null)}><Icons.X /></UnifiedButton>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </UnifiedCard>
                                                    );
                                                }

                                                const itemContent = (
                                                    <HabitItem
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
                                                        onNotify={onNotify}
                                                        formatNumber={formatNumber}
                                                        t={t}
                                                        onPending={handlePending}
                                                        isPending={pendingIds.has(h.id)}
                                                        loginHistory={loginHistory}
                                                        onSetCompletion={onSetHabitCompletion}
                                                    />
                                                );

                                                if (isDraggable) {
                                                    const isDragOver = dragOverHabitId === h.id;
                                                    let placeholderStyle = {};

                                                    if (isDragOver && dragOverPos) {
                                                        if (dragOverPos === 'above') {
                                                            placeholderStyle = { paddingTop: '50px', transition: 'padding 0.2s' };
                                                        } else {
                                                            placeholderStyle = { paddingBottom: '50px', transition: 'padding 0.2s' };
                                                        }
                                                    }

                                                    const isDraggingSelf = draggedHabitId === h.id;
                                                    const dragStyle = isDraggingSelf ? {
                                                        opacity: 0, height: 0, margin: 0, padding: 0, border: 0, overflow: 'hidden', transition: 'all 0.2s'
                                                    } : {
                                                        opacity: 1, cursor: 'move', transition: 'padding 0.2s'
                                                    };

                                                    return (
                                                        <div
                                                            key={h.id}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, h.id)}
                                                            onDragEnd={handleDragEnd}
                                                            onDragOver={(e) => handleDragOver(e, h.id)}
                                                            onDrop={(e) => handleDrop(e, h.id)}
                                                            style={{ ...dragStyle, ...placeholderStyle }}
                                                        >
                                                            {itemContent}
                                                        </div>
                                                    );
                                                }
                                                return <div key={h.id}>{itemContent}</div>;
                                            });
                                        };

                                        return (
                                            <>
                                                {renderList(activeHabits, true)}
                                                {completedBucketHabits.length > 0 && (
                                                    <details style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '5px', position: 'relative', zIndex: 1 }}>
                                                        <summary style={{ cursor: 'pointer', color: '#555', fontStyle: 'italic', marginBottom: '5px', userSelect: 'none' }}>
                                                            {t('completed_tasks')} ({completedBucketHabits.length})
                                                        </summary>
                                                        <div>
                                                            {renderList(completedBucketHabits, false)}
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
            </div>

            {/* Visual Header - Moved to bottom for Mobile-First layout */}
            <UnifiedCard variant="papyrus" padding="10px" style={{ flexShrink: 0 }}>
                <CityVisual rank={rank} score={score} population={population} formatNumber={formatNumber} playerName={playerName} />
            </UnifiedCard>
        </div >
    );
};

export default HabitsView;
