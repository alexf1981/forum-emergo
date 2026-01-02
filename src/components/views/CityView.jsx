import React, { useState } from 'react';
import * as GameLogic from '../../logic/gameLogic';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Icons from '../Icons';
import HabitItem from '../HabitItem';

import CityVisual from '../CityVisual';

const CityView = ({ habits, stats, rank, score, onToggleHabit, onIncrementHabit, onDecrementHabit, onAddHabit, onDeleteHabit, onUpdateHabit, onMoveHabit, onNotify, formatNumber }) => {
    const { t } = useLanguage();
    const { playerName } = useAuth();
    const [editingHabitId, setEditingHabitId] = useState(null);

    const handleSaveEdit = (id, newText, newBucket) => {
        onUpdateHabit(id, newText, newBucket);
        setEditingHabitId(null);
    };

    // Drag and Drop Logic
    const [draggedHabitId, setDraggedHabitId] = useState(null);
    const [dragOverHabitId, setDragOverHabitId] = useState(null);

    const handleDragStart = (e, id) => {
        e.dataTransfer.effectAllowed = 'move';
        // Delay state update to allow browser to capture drag image before collapsing
        setTimeout(() => setDraggedHabitId(id), 0);
    };

    const handleDragOver = (e, id) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        if (draggedHabitId !== id) {
            setDragOverHabitId(id);
        }
    };

    const handleDragEnd = () => {
        setDraggedHabitId(null);
        setDragOverHabitId(null);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedHabitId && targetId && draggedHabitId !== targetId) {
            onMoveHabit(draggedHabitId, targetId);
        }
        setDraggedHabitId(null);
        setDragOverHabitId(null);
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
                                            const renderList = (list, isDraggable = false) => {
                                                const draggedIndex = list.findIndex(h => h.id === draggedHabitId);

                                                return list.map((h, index) => {
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
                                                        />
                                                    );

                                                    if (isDraggable) {
                                                        const isDragOver = dragOverHabitId === h.id;
                                                        let placeholderStyle = {};
                                                        if (isDragOver && draggedIndex !== -1 && draggedIndex !== index) {
                                                            if (draggedIndex < index) {
                                                                // Dragging down, drop after -> space below
                                                                // BUT: inserting at index pushes current item down?
                                                                // Wait: splice insert at `overIndex`. If I drop on B (index 1), A becomes index 1. B becomes index 0 ?? No.
                                                                // Re-evaluate logic:
                                                                // [A(0), B(1)]. Drop A on B.
                                                                // Remove A. [B]. 
                                                                // Insert at 1. [B, A].
                                                                // A is AFTER B.
                                                                // So B should shift UP? Or create space BELOW B?
                                                                // If I hover B, and A will end up BELOW B, then B is "above" the slot.
                                                                // So I should draw a slot BELOW B.
                                                                placeholderStyle = { paddingBottom: '50px', transition: 'padding 0.2s' };
                                                            } else {
                                                                // Dragging up. [A(0), C(2)]. Drag C on A.
                                                                // Remove C. [A].
                                                                // Insert at 0. [C, A].
                                                                // C is BEFORE A.
                                                                // So A should shift DOWN. Space ABOVE A.
                                                                placeholderStyle = { paddingTop: '50px', transition: 'padding 0.2s' };
                                                            }
                                                        }

                                                        const isDraggingSelf = draggedHabitId === h.id;

                                                        // Collapse original item if dragging
                                                        const dragStyle = isDraggingSelf ? {
                                                            opacity: 0,
                                                            height: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            border: 0,
                                                            overflow: 'hidden',
                                                            transition: 'all 0.2s'
                                                        } : {
                                                            opacity: 1,
                                                            cursor: 'move',
                                                            transition: 'padding 0.2s'
                                                        };

                                                        return (
                                                            <div
                                                                key={h.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, h.id)}
                                                                onDragEnd={handleDragEnd}
                                                                onDragOver={(e) => handleDragOver(e, h.id)}
                                                                onDrop={(e) => handleDrop(e, h.id)}
                                                                style={{
                                                                    ...dragStyle,
                                                                    ...placeholderStyle
                                                                }}
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
                                                        <details style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '5px' }}>
                                                            <summary style={{ cursor: 'pointer', color: '#777', fontStyle: 'italic', marginBottom: '5px', userSelect: 'none' }}>
                                                                {t('completed_tasks')} ({completedBucketHabits.length})
                                                            </summary>
                                                            <div style={{ opacity: 0.7 }}>
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
                </main>
            </div>
        </div>
    );
};

export default CityView;
