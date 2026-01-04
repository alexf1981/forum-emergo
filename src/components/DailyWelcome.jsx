import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import * as GameLogic from '../logic/gameLogic';

const DailyWelcome = ({ onDismiss, habits, stats, buildings, research, lastWelcomeDate, formatNumber }) => {
    const { t } = useLanguage();

    // Calculate "Yesterday's" Stats (Current state before reset)
    const dailyStats = useMemo(() => {
        // Use lastWelcomeDate to identify which tasks were done "Yesterday" (or the last active day)
        // This is more robust than h.completed which might be reset by other logic
        const countCompleted = (type) => {
            return habits.filter(h => {
                const matchType = type ? h.type === type : (!h.type || h.type === 'virtue');
                const wasActive = h.history && h.history.includes(lastWelcomeDate);
                // Also fallback to h.completed if history lookup fails (e.g. legacy data or today reset edge case)
                // But generally history is the source of truth
                return matchType && (wasActive || h.completed);
            }).length;
        };

        const completedVirtues = countCompleted('virtue'); // Also counts default/null types as virtue
        const completedVices = countCompleted('vice');
        const completedTodos = countCompleted('todo');

        const population = GameLogic.getCityPopulation(buildings);
        const income = GameLogic.getDailyPassiveIncome(stats, population, research);

        return {
            completedVirtues,
            completedVices,
            completedTodos,
            income
        };
    }, [habits, stats, buildings, research, lastWelcomeDate]);

    return (
        <div
            onClick={onDismiss}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url("./assets/daily_welcome.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
        >
            <div style={{
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'white',
                maxWidth: '90%',
                width: '400px',
                border: '2px solid var(--color-gold, #C5A059)',
                boxShadow: '0 0 20px rgba(0,0,0,0.8)'
            }}>
                <h1 style={{
                    color: 'var(--color-gold, #C5A059)',
                    fontFamily: 'var(--font-heading, serif)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)'
                }}>
                    {t('welcome_title')}
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    fontStyle: 'italic',
                    marginBottom: '20px'
                }}>
                    {t('welcome_subtitle')}
                </p>

                {/* Statistics Table */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    textAlign: 'left',
                    fontSize: '0.95rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                        <span>{t('stat_virtues_completed')}:</span>
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{dailyStats.completedVirtues}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                        <span>{t('stat_vices_completed')}:</span>
                        <span style={{ color: '#ff4444', fontWeight: 'bold' }}>{dailyStats.completedVices}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                        <span>{t('stat_todos_completed')}:</span>
                        <span style={{ color: '#2196f3', fontWeight: 'bold' }}>{dailyStats.completedTodos}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                        <span>{t('stat_tax_income')}:</span>
                        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>+{formatNumber ? formatNumber(dailyStats.income.taxIncome) : dailyStats.income.taxIncome}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t('stat_interest_income')}:</span>
                        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>+{formatNumber ? formatNumber(dailyStats.income.interestIncome) : dailyStats.income.interestIncome}</span>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    {t('welcome_click')}
                </div>
            </div>
        </div>
    );
};

export default DailyWelcome;
