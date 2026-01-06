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
    onNotify,
    formatNumber,
    t,
    onPending,
    loginHistory = [], // New Prop
    onSetCompletion = () => { } // New Prop
}) => {
    const isTodo = colType === 'todo';
    // Determine recurrence based on explicit property first, fallback to legacy 'bucket' logic
    const isRecurring = habit.recurring !== undefined ? habit.recurring : !habit.bucket;
    // One-time tasks are those that are NOT recurring
    const isDoneOneTime = !isRecurring && isDone;

    // Timer Logic for One-Time Tasks
    const [progress, setProgress] = useState(0);
    const [isPendingDelete, setIsPendingDelete] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const DURATION = 10000; // 10 seconds

    // Keep track of latest props to avoid stale closures in setTimeout
    const callbacksRef = useRef({ onToggle, onDelete, habit, colType });

    useEffect(() => {
        callbacksRef.current = { onToggle, onDelete, habit, colType };
    }, [onToggle, onDelete, habit, colType]);

    const startTimer = () => {
        // Immediate Effect on Click
        if (onPending) onPending(habit.id, true);
        onToggle(habit.id); // Triggers gold update + completion state

        setIsPendingDelete(true);
        setProgress(0);
        startTimeRef.current = Date.now();

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min(100, (elapsed / DURATION) * 100);
            setProgress(p);

            if (elapsed >= DURATION) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setIsPendingDelete(false);

                // Finalize: Release pending state so it can move to completed list
                if (onPending) onPending(habit.id, false);
            }
        }, 100);
    };

    const cancelTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPendingDelete(false);
        setProgress(0);

        // Undo Effect
        onToggle(habit.id); // Refunds gold + unchecks
        if (onPending) onPending(habit.id, false);
    };

    const handleToggle = () => {
        if (isRecurring) {
            onToggle(habit.id);
            return;
        }

        // One-time tasks (Virtue/Vice/Todo)
        if (isDone && !isPendingDelete) {
            // Already done (and verified), uncheck immediately (re-open)
            onToggle(habit.id);
        } else {
            // Not done OR currently in undo-window
            if (isPendingDelete) {
                // Currently counting down -> Undo!
                cancelTimer();
            } else {
                // Start countdown (and immediate reward)
                startTimer();
            }
        }
    };

    // cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Cooldown for Plus button
    const [cooldown, setCooldown] = useState(false);

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
    const [menuPlacement, setMenuPlacement] = useState('down'); // 'down' or 'up'
    const menuRef = useRef(null);

    // Toggle logic with boundary check
    const toggleMenu = (e) => {
        if (!showMenu) {
            // Check space below
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // Calendar ~200px + padding. 300px is safe.
            if (spaceBelow < 320) {
                setMenuPlacement('up');
            } else {
                setMenuPlacement('down');
            }
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    };

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
    // User requested completed items to NOT be transparent anymore.
    const opacity = isPendingDelete ? 0.7 : 1;

    // If pending delete, overriding styles
    const containerStyle = {
        borderLeft: `3px solid ${isPendingDelete ? '#ccc' : colColor}`,
        opacity: opacity,
        backgroundColor: isPendingDelete ? '#f9f9f9' : 'rgba(255, 255, 255, 0.8)',
        transition: 'all 0.5s',
        zIndex: showMenu ? 50 : 1, // Ensure menu is on top
        position: 'relative'
    };

    return (
        <div
            id={`habit-item-${habit.id}`}
            data-type={colType}
            data-recurring={isRecurring}
            data-bucket={!!habit.bucket}
            className={`habit-item compact ${isDoneOneTime ? 'completed' : ''}`}
            style={containerStyle}
        >
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>

                {isRecurring ? (
                    // Plus/Minus Controls
                    <div className="recurring-controls" style={{ display: 'flex', alignItems: 'center', marginRight: '8px', gap: '4px' }}>
                        <button
                            className="btn-icon small"
                            onClick={handleMinus}
                            disabled={dailyCount <= 0}
                            style={{
                                width: '20px', height: '20px', padding: 0,
                                border: `1px solid ${colColor}`,
                                color: colColor,
                                opacity: dailyCount <= 0 ? 0.3 : 1,
                                fontSize: '12px', lineHeight: 1
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
                                fontSize: '12px', lineHeight: 1
                            }}
                        >
                            +
                        </button>
                    </div>
                ) : (
                    // Checkbox / Undo Circle
                    <div
                        className={`habit-checkbox compact ${(isDone || isPendingDelete) ? 'checked' : ''}`}
                        style={{
                            borderColor: isPendingDelete ? '#999' : colColor,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={handleToggle}
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
                    {!habit.bucket && dailyCount > 0 && <span style={{ marginLeft: '4px', color: 'var(--color-gold)', fontWeight: 'bold' }}>({formatNumber(dailyCount)})</span>}

                    {isPendingDelete && <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#999', fontStyle: 'italic' }}>({Math.ceil((DURATION - (progress / 100) * DURATION) / 1000)}s)</span>}
                </span>
            </div>

            <div className="habit-controls habit-menu-container" ref={menuRef}>
                <button
                    className="btn-icon small menu-toggle onboarding-target-menu"
                    onClick={toggleMenu}
                    title="Menu"
                >
                    <Icons.Menu />
                </button>

                {showMenu && (
                    <div
                        className="habit-menu-dropdown"
                        style={{
                            top: menuPlacement === 'down' ? '100%' : 'auto',
                            bottom: menuPlacement === 'up' ? '100%' : 'auto',
                            marginTop: menuPlacement === 'down' ? '4px' : 0,
                            marginBottom: menuPlacement === 'up' ? '4px' : 0,
                        }}
                    >
                        <button className="menu-item" onClick={() => { onEdit(habit.id); setShowMenu(false); }}>
                            <Icons.Edit />
                            <span>{t('edit')}</span>
                        </button>
                        <button className="menu-item delete" onClick={() => { onDelete(habit.id); setShowMenu(false); }}>
                            <Icons.Trash />
                            <span>{t('delete')}</span>
                        </button>


                        {(colType === 'virtue' || colType === 'vice') && (
                            <div style={{
                                marginTop: '4px',
                                borderTop: '1px solid #eee',
                                paddingTop: '8px',
                                paddingLeft: '4px',
                                paddingRight: '4px',
                                minWidth: '250px' // Force wider menu for bigger boxes
                            }}>
                                {/* Success Rate Display */}
                                {(() => {
                                    const calculateSuccessRate = () => {
                                        let valid = 0;
                                        let success = 0;
                                        const now = new Date();
                                        const history = habit.history || [];

                                        // Loop strictly last 28 days (Visible Calendar)
                                        for (let i = 0; i < 28; i++) {
                                            const d = new Date(now);
                                            d.setDate(now.getDate() - i); // i=0 is Today, i=27 is 4 weeks ago

                                            const y = d.getFullYear();
                                            const m = String(d.getMonth() + 1).padStart(2, '0');
                                            const da = String(d.getDate()).padStart(2, '0');
                                            const dateString = `${y}-${m}-${da}`;

                                            // 1. Exclude Exempt
                                            if (history.includes(`-${dateString}`)) continue;

                                            // 2. Logic Status
                                            const isCompleted = history.includes(dateString);
                                            const isSkipped = history.includes(`!${dateString}`);
                                            const hasLoggedIn = loginHistory && loginHistory.includes(dateString);

                                            // 3. Exclude Grey (No Data)
                                            // Grey = Not Login AND Not Explicit
                                            if (!isCompleted && !isSkipped && !hasLoggedIn) continue;

                                            // It is Valid
                                            valid++;

                                            if (colType === 'vice') {
                                                // Vice Success = NOT DONE (Avoided)
                                                if (!isCompleted) success++;
                                            } else {
                                                // Virtue Success = DONE
                                                if (isCompleted) success++;
                                            }
                                        }

                                        if (valid === 0) return null;
                                        const rate = Math.round((success / valid) * 100);
                                        return (
                                            <div style={{
                                                textAlign: 'center',
                                                marginBottom: '8px',
                                                fontSize: '12px',
                                                color: '#666',
                                                fontWeight: 'bold'
                                            }}>
                                                {t('success_rate_4w')}: <span style={{ color: rate >= 80 ? 'var(--color-virtue)' : (rate < 50 ? 'var(--color-vice)' : '#666') }}>{rate}%</span>
                                            </div>
                                        );
                                    };
                                    return calculateSuccessRate();
                                })()}
                                {/* Headers */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '2px',
                                    marginBottom: '4px',
                                    width: '100%'
                                }}>
                                    {(t('days_short') || "Ma,Di,Wo,Do,Vr,Za,Zo").split(',').map((day, i) => (
                                        <div key={i} style={{
                                            fontSize: '12px', // Larger text (closer to menu items)
                                            textAlign: 'center',
                                            color: '#555',
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize'
                                        }}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '2px',
                                    width: '100%'
                                }}>
                                    {(() => {
                                        const cells = [];
                                        const now = new Date();
                                        const todayStr = (() => {
                                            const y = now.getFullYear();
                                            const m = String(now.getMonth() + 1).padStart(2, '0');
                                            const d = String(now.getDate()).padStart(2, '0');
                                            return `${y}-${m}-${d}`;
                                        })();

                                        // Strict 28 days history
                                        const HISTORY_DAYS = 28;
                                        const startDate = new Date(now);
                                        startDate.setDate(now.getDate() - (HISTORY_DAYS - 1));

                                        // Calculate Padding for Start (Monday based)
                                        // JS getDay(): Sun=0, Mon=1...
                                        // We want Mon=0, ..., Sun=6
                                        const startDay = startDate.getDay();
                                        const padCount = startDay === 0 ? 6 : startDay - 1;

                                        // Add Padding Cells
                                        for (let i = 0; i < padCount; i++) {
                                            cells.push(<div key={`pad-${i}`} />);
                                        }

                                        // Add Day Cells
                                        for (let i = 0; i < HISTORY_DAYS; i++) {
                                            const d = new Date(startDate);
                                            d.setDate(startDate.getDate() + i);

                                            const y = d.getFullYear();
                                            const m = String(d.getMonth() + 1).padStart(2, '0');
                                            const da = String(d.getDate()).padStart(2, '0');
                                            const dateString = `${y}-${m}-${da}`;

                                            // Future check for opacity
                                            const dNoTime = new Date(y, d.getMonth(), d.getDate());
                                            const nowNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                            const isStrictFuture = dNoTime > nowNoTime;
                                            const isToday = dateString === todayStr;

                                            // Determine Status
                                            const isExample = isStrictFuture;
                                            const hasLoggedIn = loginHistory && loginHistory.includes(dateString);

                                            // isCompleted: Normal completion
                                            const isCompleted = habit.history && habit.history.includes(dateString);

                                            // isSkipped: Explicit failure marker (!date)
                                            const isSkipped = habit.history && habit.history.includes(`!${dateString}`);

                                            // isExempt: Explicit grey marker (-date)
                                            const isExempt = habit.history && habit.history.includes(`-${dateString}`);

                                            const completionCount = habit.history ? habit.history.filter(d => d === dateString).length : 0;

                                            // BG Color Logic
                                            let bgColor = '#f5f5f5'; // Default Grey (Not logged in / Unknown)

                                            if (isToday) {
                                                bgColor = '#bfdbfe'; // Today is simple Blue
                                            } else {
                                                // Priority: Explicit State > Login State > Default
                                                if (isCompleted) {
                                                    // Green (or Red for Vice)
                                                    bgColor = colType === 'vice' ? '#fee2e2' : '#dcfce7';
                                                } else if (isSkipped) {
                                                    // Red (or Green for Vice)
                                                    bgColor = colType === 'vice' ? '#dcfce7' : '#fee2e2';
                                                } else if (isExempt) {
                                                    // Explicit Grey
                                                    bgColor = '#f5f5f5';
                                                } else if (hasLoggedIn) {
                                                    // Implied miss due to login
                                                    bgColor = colType === 'vice' ? '#dcfce7' : '#fee2e2';
                                                }
                                            }

                                            // HANDLER
                                            const handleCellClick = () => {
                                                if (isStrictFuture || isToday) return;

                                                // Calculate current count for THIS date specifically
                                                const count = completionCount;

                                                if (isRecurring) {
                                                    // Recurring: Prompt for exact number
                                                    const input = window.prompt("Aantal keer voltooid op " + dateString + ":", count);
                                                    if (input === null) {
                                                        // Cancel -> Do nothing
                                                    } else if (input.trim() === '') {
                                                        // Empty -> Explicitly Set to Exempt (Grey)
                                                        // This forces "No Data" state even if logged in
                                                        onSetCompletion(habit.id, dateString, -1);
                                                    } else {
                                                        const newVal = parseInt(input);
                                                        if (!isNaN(newVal) && newVal >= 0) {
                                                            onSetCompletion(habit.id, dateString, newVal);
                                                        }
                                                    }
                                                } else {
                                                    // One-Time: 3-State Cycle
                                                    // State 1: Grey (Unknown) -> (!isCompleted && !isSkipped && !hasLoggedIn)
                                                    // State 2: Green (Done) -> isCompleted
                                                    // State 3: Red (Missed) -> isSkipped || (hasLoggedIn && !isCompleted)

                                                    if (isCompleted) {
                                                        // Green -> Red (0 / Skipped)
                                                        onSetCompletion(habit.id, dateString, 0);
                                                    } else if (isSkipped || (hasLoggedIn && !isExempt)) {
                                                        // Red -> Grey (Exempt)
                                                        // Note: We use -1 to force Exempt state
                                                        onSetCompletion(habit.id, dateString, -1);
                                                    } else {
                                                        // Grey -> Green (Done)
                                                        // (Includes isExempt or Default Grey)
                                                        onSetCompletion(habit.id, dateString, 1);
                                                    }
                                                }
                                            };

                                            cells.push(
                                                <div key={i}
                                                    className="calendar-cell"
                                                    title={dateString}
                                                    onClick={handleCellClick}
                                                    style={{
                                                        aspectRatio: '1',
                                                        backgroundColor: bgColor,
                                                        borderRadius: '2px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '10px',
                                                        color: '#333',
                                                        opacity: isStrictFuture ? 0.3 : 1,
                                                        cursor: (isStrictFuture || isToday) ? 'default' : 'pointer' // non-interactive for future & today
                                                    }}>
                                                    {/* CONTENT LOGIC */}
                                                    {isCompleted ? (
                                                        // COMPLETED STATE
                                                        colType === 'virtue' ? (
                                                            // Virtue (Green): Checkmark or Number
                                                            isRecurring && completionCount > 1 ?
                                                                <span style={{ fontWeight: 'bold' }}>{completionCount}</span> :
                                                                <Icons.Check style={{ width: '100%', height: '100%', color: colColor }} />
                                                        ) : (
                                                            // Vice (Red): X or Number
                                                            isRecurring ?
                                                                <span style={{ fontWeight: 'bold' }}>{completionCount}</span> :
                                                                <Icons.X style={{ width: '100%', height: '100%', color: colColor }} />
                                                        )
                                                    ) : (
                                                        // NOT COMPLETED STATE
                                                        // Check if we should show "Failure" (Virtue -> X) or "Success" (Vice -> Check)
                                                        (isSkipped || (hasLoggedIn && !isExempt)) ? (
                                                            colType === 'virtue' ? (
                                                                // Virtue Missed (Red): Show X or 0 (if recurring)
                                                                isRecurring ?
                                                                    <span style={{ fontWeight: 'bold' }}>0</span> :
                                                                    <Icons.X style={{ width: '100%', height: '100%', color: colColor, opacity: 0.5 }} />
                                                            ) : (
                                                                // Vice Avoided (Green): Show Check or 0
                                                                isRecurring ?
                                                                    <span style={{ fontWeight: 'bold' }}>0</span> :
                                                                    <Icons.Check style={{ width: '100%', height: '100%', color: colColor, opacity: 0.5 }} />
                                                            )
                                                        ) : null
                                                    )}
                                                </div>
                                            );
                                        }
                                        return cells;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitItem;
