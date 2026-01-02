import React, { useState, useEffect, useRef } from 'react';
import Icons from './Icons';

const HabitItem = ({
    habit,
    colType,
    colColor,
    isDone,
    dailyCount,
    onToggle,
    onDelete,
    onEdit,
    onIncrement,
    onDecrement,
    formatNumber,
    t
}) => {
    const isTodo = colType === 'todo';
    const isDoneOneTime = habit.bucket && isDone;
    const isRecurring = !habit.bucket;

    // Timer Logic for Mandata
    const [progress, setProgress] = useState(0);
    const [isPendingDelete, setIsPendingDelete] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const DURATION = 15000; // 15 seconds

    // Cooldown for Plus button
    const [cooldown, setCooldown] = useState(false);

    useEffect(() => {
        const shouldRun = isTodo && isDoneOneTime;

        if (shouldRun) {
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now();
                setIsPendingDelete(true);
                setProgress(0);
            }

            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const p = Math.min(100, (elapsed / DURATION) * 100);
                setProgress(p);

                if (elapsed >= DURATION) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    onDelete(habit.id, true);
                }
            }, 100);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            startTimeRef.current = null;
            setIsPendingDelete(false);
            setProgress(0);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isTodo, isDoneOneTime, habit.id, onDelete]);

    const handlePlus = (e) => {
        e.stopPropagation();
        if (cooldown) return;
        onIncrement(habit.id, e);
        setCooldown(true);
        setTimeout(() => setCooldown(false), 2000);
    };

    const handleMinus = (e) => {
        e.stopPropagation();
        onDecrement(habit.id);
    };

    // Menu State
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Derived Visuals
    const opacity = isPendingDelete ? 0.7 : (isDoneOneTime ? 0.5 : 1);

    // If pending delete, overriding styles
    const containerStyle = {
        borderLeft: `3px solid ${isPendingDelete ? '#ccc' : colColor}`,
        opacity: opacity,
        backgroundColor: isPendingDelete ? '#f9f9f9' : 'rgba(255, 255, 255, 0.8)',
        transition: 'all 0.5s',
        zIndex: showMenu ? 50 : 1, // Ensure menu appears above valid siblings
        position: 'relative' // Needed for z-index to work with stacking context of siblings
    };

    return (
        <div className={`habit-item compact ${isDoneOneTime ? 'completed' : ''}`} style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>

                {isRecurring ? (
                    // Plus/Minus Controls
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px', gap: '4px' }}>
                        <button
                            className="btn-icon small"
                            onClick={handleMinus}
                            disabled={dailyCount <= 0}
                            style={{
                                width: '20px', height: '20px', padding: 0,
                                border: `1px solid ${colColor}`,
                                color: colColor,
                                opacity: dailyCount <= 0 ? 0.3 : 1,
                                fontSize: '14px', lineHeight: 1
                            }}
                        >
                            -
                        </button>
                        <button
                            className="btn-icon small"
                            onClick={handlePlus}
                            disabled={cooldown}
                            style={{
                                width: '20px', height: '20px', padding: 0,
                                border: `1px solid ${colColor}`,
                                backgroundColor: cooldown ? '#eee' : 'transparent',
                                color: cooldown ? '#aaa' : colColor,
                                cursor: cooldown ? 'default' : 'pointer',
                                fontSize: '14px', lineHeight: 1
                            }}
                        >
                            +
                        </button>
                    </div>
                ) : (
                    // Checkbox / Undo Circle
                    <div
                        className={`habit-checkbox compact ${isDone ? 'checked' : ''}`}
                        style={{
                            borderColor: isPendingDelete ? '#999' : colColor,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => onToggle(habit.id)}
                    >
                        {isPendingDelete ? (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ddd" strokeWidth="4" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={colColor} strokeWidth="4" strokeDasharray={`${progress}, 100`} />
                                </svg>
                                <span style={{ position: 'absolute', color: '#555', fontSize: '8px', fontWeight: 'bold' }}>↩</span>
                            </div>
                        ) : (
                            isDone && (colType === 'vice' ? <span style={{ color: colColor, fontWeight: 'bold' }}>X</span> : <Icons.Check style={{ width: 14, height: 14 }} />)
                        )}
                    </div>
                )}

                <span className="habit-text" style={isDone && colType === 'todo' ? { textDecoration: 'line-through', color: '#888' } : {}}>
                    {habit.text}
                    {!habit.bucket && dailyCount > 0 && <span style={{ marginLeft: '4px', color: 'var(--color-gold)', fontWeight: 'bold' }}>x{formatNumber(dailyCount)}</span>}
                    {colType === 'vice' && dailyCount > 0 && <span style={{ marginLeft: '4px', color: '#ff4444', fontWeight: 'bold' }}>(-20g)</span>}
                    {isPendingDelete && <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#999', fontStyle: 'italic' }}>({Math.ceil((DURATION - (progress / 100) * DURATION) / 1000)}s)</span>}
                </span>
            </div>

            <div className="habit-controls habit-menu-container" ref={menuRef}>
                <button
                    className="btn-icon small menu-toggle"
                    onClick={() => setShowMenu(!showMenu)}
                    title="Menu"
                >
                    <Icons.Menu />
                </button>

                {showMenu && (
                    <div className="habit-menu-dropdown">
                        <button className="menu-item" onClick={() => { onEdit(habit.id); setShowMenu(false); }}>
                            <Icons.Edit />
                            <span>{t('edit')}</span>
                        </button>
                        <button className="menu-item delete" onClick={() => { onDelete(habit.id); setShowMenu(false); }}>
                            <Icons.Trash />
                            <span>{t('delete')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitItem;
