import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import UnifiedModal from '../layout/UnifiedModal';
import * as GameLogic from '../../logic/gameLogic';
import Icons from '../Icons';
import '../../css/adventure.css';

const AdventureView = ({ quests, heroes, stats, actions, buildings, habits, loginHistory, dailyQuestIds = [] }) => {
    const { t } = useLanguage();
    const [selectedQuestId, setSelectedQuestId] = useState(null);
    const [selectedHeroIds, setSelectedHeroIds] = useState([]);
    const [showInspiration, setShowInspiration] = useState(false);

    // --- SECTIONS ---
    const activeQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);

    // Check if Tavern is built (used for hero requirements)
    const hasTavern = buildings.some(b => b.type === 'tavern');

    // Check if Introspection (Quest 0) is completed
    const isIntrospectionDone = quests.some(q => q.templateId === 'introspection' && q.completed);

    const availableTemplates = GameLogic.QUEST_TEMPLATES.filter(template => {
        // Only show quests that are NOT completed (unique quests logic)
        // If we want repeatable quests later, we change this.
        const isDone = completedQuests.some(q => q.templateId === template.id);

        // Hide if already active (one instance allowed at a time)
        const isActive = activeQuests.some(q => q.templateId === template.id);
        if (isActive) return false;

        // --- NEW: DAILY ROTATION FILTER ---
        // If it's a daily legacy quest (not tutorial), check if it's in today's rotation
        // Tutorial 'introspection' is always available if not done
        if (template.id !== 'introspection') {
            // If we have dailyQuestIds (meaning rotation is active), strict check
            if (dailyQuestIds && dailyQuestIds.length > 0) {
                if (!dailyQuestIds.includes(template.id)) return false;
            }
        }

        // Hero Requirement
        if (template.requirements?.heroCount) {
            // Hide if no heroes available (regardless of Tavern existence)
            if (heroes.length === 0) return false;

            return !isDone;
        }

        return !isDone;
    });

    // [DEBUG] Log Adventure State
    React.useEffect(() => {
        // Import DebugLogger dynamically if needed or assume it's global/imported. 
        // AdventureView doesn't import DebugLogger. Let's rely on console for now or add import.
        console.log("AdventureView State:", {
            heroesCount: heroes.length,
            hasTavern,
            activeQuestsCount: activeQuests.filter(q => {
                const templ = GameLogic.QUEST_TEMPLATES.find(t => t.id === q.templateId);
                if (templ && templ.requirements?.heroCount && heroes.length === 0) return false;
                return true;
            }).length,
            availableTemplatesCount: availableTemplates.length,
            availableNames: availableTemplates.map(t => t.id)
        });
    }, [heroes.length, hasTavern, activeQuests.length, availableTemplates.length]);

    const handleStartQuest = () => {
        if (!selectedQuestId) return;

        // Update: Quest 0 now starts IMMEDIATELY -> moves to active section
        actions.startQuest(selectedQuestId, selectedHeroIds);

        setSelectedQuestId(null);
        setSelectedHeroIds([]);
    };

    const handleCompleteQuest = (instanceId) => {
        const quest = quests.find(q => q.id === instanceId);
        if (!quest) return;
        actions.completeQuest(instanceId);
    };

    const toggleHeroSelection = (heroId) => {
        setSelectedHeroIds(prev => {
            if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
            return [...prev, heroId];
        });
    };

    const renderInspirationModal = () => {
        if (!showInspiration) return null;

        const categories = Object.keys(GameLogic.INSPIRATION_HABITS);

        return (
            <UnifiedModal
                isOpen={true}
                onClose={() => setShowInspiration(false)}
                title={t('header_inspiration')}
            >
                <p style={{ fontStyle: 'italic', margin: '0 0 20px 0', color: '#555', fontSize: '0.95rem' }}>
                    {t('msg_inspiration_intro')}
                </p>

                <div className="inspiration-grid">
                    {categories.map(cat => {
                        const catHabits = GameLogic.INSPIRATION_HABITS[cat];

                        // Filter out habits that are already in the user's list
                        const availableHabits = catHabits.filter(h =>
                            !habits.some(userHabit => userHabit.text === t(h.text))
                        );

                        if (availableHabits.length === 0) return null;

                        const virtues = availableHabits.filter(h => h.type === 'virtue');
                        const vices = availableHabits.filter(h => h.type === 'vice');

                        return (
                            <div key={cat} style={{ marginBottom: '30px' }}>
                                <h4 style={{ textTransform: 'capitalize', borderBottom: '1px solid #ddd', marginBottom: '15px', color: '#2c3e50', paddingBottom: '5px' }}>
                                    {t(cat) || cat}
                                </h4>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
                                    {/* Virtues Column (Green) */}
                                    <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {virtues.length > 0 && virtues.map((habit, idx) => (
                                            <button
                                                key={`v-${cat}-${idx}`}
                                                className="btn-text"
                                                style={{
                                                    border: '1px solid #27ae60',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    color: '#000',
                                                    padding: '10px 15px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.95rem',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => actions.addHabit(t(habit.text), habit.type, true)}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                                                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(39, 174, 96, 0.3)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2rem' }}>🟢</span>
                                                <span style={{ fontWeight: '500' }}>{t(habit.text)}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Vices Column (Red) */}
                                    <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {vices.length > 0 && vices.map((habit, idx) => (
                                            <button
                                                key={`vc-${cat}-${idx}`}
                                                className="btn-text"
                                                style={{
                                                    border: '1px solid #c0392b',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    color: '#000',
                                                    padding: '10px 15px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.95rem',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => actions.addHabit(t(habit.text), habit.type, true)}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                                                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(192, 57, 43, 0.3)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2rem' }}>🔴</span>
                                                <span style={{ fontWeight: '500' }}>{t(habit.text)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </UnifiedModal>
        );
    };

    return (
        <div className="adventure-view">
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#f1c40f', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {t('nav_adventure') || 'Avonturen'}
            </h2>

            {/* 1. Lopende Avonturen (Active) */}
            {activeQuests.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ borderBottom: '2px solid #bdc3c7', paddingBottom: '10px', marginBottom: '15px', color: '#ecf0f1', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('quest_section_active') || 'Lopende avonturen'}
                    </h3>
                    <div className="quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {activeQuests.filter(q => {
                            // EXTRA CHECK: Hide active quests that need heroes if we have none (e.g. auto-started tutorial)
                            const templ = GameLogic.QUEST_TEMPLATES.find(t => t.id === q.templateId);
                            if (templ && templ.requirements?.heroCount && heroes.length === 0) return false;
                            return true;
                        }).map(q => {
                            const template = GameLogic.QUEST_TEMPLATES.find(t => t.id === q.templateId);
                            if (!template) return null;

                            // Special logic for specific missions
                            const isIntrospection = template.id === 'introspection';
                            let introspectionProgress = "";
                            let isComplete = false;

                            // Achievement Logic
                            if (isIntrospection) {
                                // Count habits created AFTER quest start
                                const addedCount = habits.filter(h => {
                                    if (!h.createdAt) return false;
                                    return new Date(h.createdAt) > new Date(q.startTime);
                                }).length;

                                const target = 5;
                                const progressText = t('quest_introspection_progress', { count: Math.min(addedCount, target), total: target });
                                introspectionProgress = progressText;
                                isComplete = addedCount >= target;
                            }
                            else if (template.id === 'login_streak') {
                                const current = GameLogic.getLoginStreak(loginHistory);
                                const target = template.target || 5;
                                introspectionProgress = `${current} / ${target} ${t('days') || 'dagen'}`;
                                isComplete = current >= target;
                            }
                            else if (template.id === 'virtue_streak') {
                                const current = GameLogic.getVirtueStreak(habits);
                                const target = template.target || 3;
                                introspectionProgress = `${current} / ${target} ${t('days') || 'dagen'}`;
                                isComplete = current >= target;
                            }
                            else if (template.id === 'vice_resistance') {
                                const current = GameLogic.getViceResistanceStreak(habits, loginHistory);
                                const target = template.target || 3;
                                introspectionProgress = `${current} / ${target} ${t('days') || 'dagen'}`;
                                isComplete = current >= target;
                            }
                            else if (template.id === 'daily_productivity') {
                                const current = GameLogic.get24hTaskCount(habits, q.startTime);
                                const target = template.target || 5;

                                // Countdown Logic
                                const start = new Date(q.startTime);
                                const end = new Date(start.getTime() + (24 * 60 * 60 * 1000));
                                const now = new Date();

                                let timeText = "";
                                if (now > end) {
                                    timeText = t('expired') || "Verlopen";
                                } else {
                                    const diffMs = end - now;
                                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                    timeText = `${diffHrs}u ${diffMins}m`;
                                }

                                const txt_tasks_completed = t('txt_tasks_completed') || 'taken afgerond';
                                introspectionProgress = `${current} / ${target} ${txt_tasks_completed} (${timeText})`;
                                isComplete = current >= target;
                            }
                            else {
                                isComplete = false;
                            }

                            return (
                                <div key={q.id} className="quest-card active" style={{
                                    border: '2px solid #27ae60', // Green border for active
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}>
                                    {/* Header Section: Image, Content, Icons */}
                                    <div className="quest-card-header">
                                        {/* 1. Image */}
                                        <img
                                            src="/assets/quest_placeholder.png"
                                            alt="Quest"
                                            className="quest-card-image"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />

                                        {/* 2. Middle Content: Title, Inspiration, Progress */}
                                        <div className="quest-card-content" style={{ minWidth: 0, flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                                                {t(`quest_${template.id}_name`) || template.name}
                                            </h4>

                                            {/* Inspiration Button */}
                                            {isIntrospection && (
                                                <button
                                                    className="btn-text"
                                                    onClick={() => setShowInspiration(true)}
                                                    style={{
                                                        textAlign: 'left',
                                                        padding: '4px 10px',
                                                        background: '#f1c40f',
                                                        color: '#3d0a00',
                                                        borderRadius: '15px',
                                                        border: '1px solid #c0392b',
                                                        cursor: 'pointer',
                                                        width: 'fit-content',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        marginBottom: '5px'
                                                    }}
                                                >
                                                    <span>💡</span> {t('btn_inspiration')}
                                                </button>
                                            )}

                                            {/* Progress Text */}
                                            <div style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {introspectionProgress ? introspectionProgress : (t('status_in_progress') || 'Bezig...')}
                                            </div>
                                        </div>

                                        {/* 3. Right Stats: 2 Rows + Complete Button */}
                                        <div className="quest-card-stats" style={{ textAlign: 'right', fontSize: '0.9rem', color: '#555', minWidth: '80px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', flexShrink: 0 }}>
                                            {/* Row 1: Strength & Time */}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div title="Helden Vereist" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.requirements?.heroCount || 0}</span> <Icons.Arm width="16" height="16" />
                                                </div>
                                                <div title="Duur" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.id === 'daily_productivity' ? '24u' : (template.type === 'instant' ? t('duration_none') : `${template.durationDays}d`)}</span> <Icons.Hourglass width="16" height="16" />
                                                </div>
                                            </div>

                                            {/* Row 2: Gold & XP */}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div title="Goud" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.rewards.gold}</span> <Icons.Coin width="16" height="16" />
                                                </div>
                                                <div title="XP" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.rewards.xp}</span> <Icons.Star width="16" height="16" />
                                                </div>
                                            </div>

                                            {/* Complete Button (Right aligned, under icons) */}
                                            <button
                                                className="btn"
                                                onClick={() => handleCompleteQuest(q.id)}
                                                disabled={!isComplete}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 10px',
                                                    backgroundColor: isComplete ? '#2c3e50' : '#bdc3c7',
                                                    color: 'white',
                                                    cursor: isComplete ? 'pointer' : 'not-allowed',
                                                    opacity: isComplete ? 1 : 0.7,
                                                    marginTop: '5px',
                                                    border: 'none',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {t('btn_complete') || 'Voltooien'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Nieuwe Avonturen (Available) */}
            <div>
                <h3 style={{ borderBottom: '2px solid #bdc3c7', paddingBottom: '10px', marginBottom: '15px', color: '#ecf0f1', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {t('quest_section_available') || 'Nieuwe avonturen'}
                </h3>

                {/* Show "No Heroes" message if we have no heroes (regardless of Tavern) */}
                {heroes.length === 0 ? (
                    <div style={{
                        padding: '30px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        color: '#333',
                        fontSize: '1rem',
                        fontWeight: '500',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #ddd'
                    }}>
                        {t('msg_no_tavern_quests')}
                    </div>
                ) : (
                    <div className="quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {availableTemplates.map(template => {
                            const isSelected = selectedQuestId === template.id;
                            const heroReq = template.requirements?.heroCount || 0;

                            // Calculate selected stats
                            const selectedHeroesList = heroes.filter(h => selectedHeroIds.includes(h.id));
                            const selectedHeroesCount = selectedHeroesList.length;
                            const totalLevel = selectedHeroesList.reduce((sum, h) => sum + h.lvl, 0);

                            // Requirements Check
                            // 1. Level Requirement
                            const levelMet = !template.level || totalLevel >= template.level;
                            // 2. Hero Count Requirement
                            const countMet = selectedHeroesCount >= heroReq;

                            const requirementsMet = countMet && levelMet;

                            // Lock logic:
                            // 1. Lock if Intro not done (and this isn't Intro)
                            const isIntroLocked = template.id !== 'introspection' && !isIntrospectionDone;

                            // 2. Lock if Total Roster (all heroes) Level < Required Level
                            // This prevents even attempting missions you can't possibly clear
                            const totalRosterLevel = heroes.reduce((sum, h) => sum + h.lvl, 0);
                            const isLevelLocked = template.level && totalRosterLevel < template.level;

                            const isLocked = isIntroLocked || isLevelLocked;

                            // Determine Lock Message
                            let subText = `"${t(template.flavor)}"`;
                            if (isLevelLocked) {
                                subText = t('msg_level_too_low', { level: template.level });
                            } else if (isIntroLocked) {
                                subText = t('msg_complete_intro_first');
                            }

                            return (
                                <div key={template.id} className={`quest-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (isLocked) return;
                                        setSelectedQuestId(isSelected ? null : template.id);
                                    }}
                                    style={{
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        // Inline overrides for dynamic logic specific to selection/locking
                                        border: '2px solid transparent', // Reset by class but kept for safety
                                        opacity: isLocked ? 0.6 : 1,
                                        filter: isLocked ? 'grayscale(100%)' : 'none',
                                        boxShadow: isSelected
                                            ? 'inset 0 0 0 2px #3498db, 0 4px 8px rgba(0,0,0,0.2)'
                                            : '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {/* Header / Collapsed View */}
                                    <div className="quest-card-header">
                                        {/* LEFT: Image + Title + Subtitle */}
                                        <div style={{ display: 'flex', gap: '15px', flex: 1, minWidth: 0 }}>
                                            {/* Thematic Image Placeholder */}
                                            <img
                                                src="/assets/quest_placeholder.png"
                                                alt="Quest"
                                                className="quest-card-image"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />

                                            <div className="quest-card-content" style={{ minWidth: 0 }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {t(template.name)}
                                                </h4>
                                                <div className="quest-card-subtext" style={{ fontSize: '0.9rem', color: '#7f8c8d', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {subText}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT: Stats Icons (2 Rows) */}
                                        <div className="quest-card-stats" style={{ textAlign: 'right', fontSize: '0.9rem', color: '#555', minWidth: '80px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', flexShrink: 0 }}>
                                            {/* Row 1: Strength & Time */}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div title={template.level > 0 ? "Min Level" : "Helden Vereist"} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {template.level > 0 && <span>🔒</span>}
                                                    <span>{template.level > 0 ? `${template.level}+` : heroReq}</span> <Icons.Arm width="16" height="16" />
                                                </div>
                                                <div title="Duur" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.id === 'daily_productivity' ? '24u' : (template.type === 'instant' ? t('duration_none') : `${template.durationDays || '?'}d`)}</span> <Icons.Hourglass width="16" height="16" />
                                                </div>
                                            </div>

                                            {/* Row 2: Gold & XP */}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div title="Goud" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.rewards.gold}</span> <Icons.Coin width="16" height="16" />
                                                </div>
                                                <div title="XP" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span>{template.rewards.xp}</span> <Icons.Star width="16" height="16" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isSelected && (
                                        <div className="quest-details" style={{
                                            marginTop: '20px',
                                            borderTop: '1px solid #ecf0f1',
                                            paddingTop: '15px',
                                            paddingLeft: '10px',
                                            paddingRight: '10px',
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            overflow: 'hidden',
                                            wordBreak: 'break-word'
                                        }} onClick={e => e.stopPropagation()}>

                                            {/* Thematic Description */}
                                            <div style={{
                                                fontStyle: 'italic',
                                                textAlign: 'center',
                                                padding: '0 20px 20px 20px',
                                                color: '#555',
                                                fontSize: '0.95rem',
                                                width: '100%',
                                                maxWidth: '100%',
                                                boxSizing: 'border-box',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                                hyphens: 'auto'
                                            }}>
                                                {t(template.desc)}
                                            </div>

                                            {/* Task List */}
                                            <div style={{ marginBottom: '20px', maxWidth: '100%' }}>
                                                <strong style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>{t('quest_task_header') || 'Uw taak:'}</strong>

                                                <ul style={{
                                                    margin: 0,
                                                    paddingLeft: '20px',
                                                    color: '#444',
                                                    overflowWrap: 'anywhere',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'normal',
                                                    maxWidth: '100%',
                                                    boxSizing: 'border-box'
                                                }}>
                                                    <li>{t(`quest_${template.id}_task`)}</li>
                                                </ul>
                                            </div>

                                            {/* Hero Selection */}
                                            {heroReq > 0 && (
                                                <div style={{ marginBottom: '20px' }}>
                                                    <strong style={{ display: 'block', marginBottom: '5px', color: '#2c3e50' }}>{t('lbl_select_heroes')}</strong>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        {heroes.filter(h => h.status === 'IDLE').map(h => {
                                                            const isHeroSelected = selectedHeroIds.includes(h.id);
                                                            return (
                                                                <div key={h.id}
                                                                    onClick={() => toggleHeroSelection(h.id)}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        border: isHeroSelected ? '1px solid #27ae60' : '1px solid #bdc3c7',
                                                                        borderRadius: '4px',
                                                                        background: isHeroSelected ? 'rgba(39, 174, 96, 0.1)' : 'white',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: isHeroSelected ? 'bold' : 'normal',
                                                                        color: isHeroSelected ? '#27ae60' : '#7f8c8d'
                                                                    }}
                                                                >
                                                                    {h.name} (Lv{h.lvl})
                                                                </div>
                                                            );
                                                        })}
                                                        {heroes.filter(h => h.status === 'IDLE').length === 0 && <span style={{ color: '#999', fontSize: '0.9rem' }}>Geen helden beschikbaar.</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button: Bottom Right */}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                                <button className="btn"
                                                    style={{
                                                        backgroundColor: requirementsMet ? '#2c3e50' : '#bdc3c7',
                                                        color: 'white',
                                                        padding: '10px 20px',
                                                        borderRadius: '5px',
                                                        border: 'none',
                                                        fontWeight: 'bold',
                                                        cursor: requirementsMet ? 'pointer' : 'not-allowed'
                                                    }}
                                                    disabled={!requirementsMet}
                                                    onClick={handleStartQuest}
                                                >
                                                    {t('start_mission') || 'Start Missie'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {renderInspirationModal()}
        </div >
    );
};

export default AdventureView;
