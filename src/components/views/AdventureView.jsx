import React from 'react';
import * as GameLogic from '../../logic/gameLogic';

import { useLanguage } from '../../context/LanguageContext';

const AdventureView = ({ heroes, selectedQuest, onSelectQuest, onGoAdventure, onFightBoss, formatNumber, combatLog }) => {
    const { t } = useLanguage();

    const renderMessage = (msgObj) => {
        if (!msgObj) return "";
        if (typeof msgObj === 'string') return msgObj;
        const { key, args } = msgObj;
        if (!key) return "";

        const tArgs = { ...args };
        if (tArgs.quest && typeof tArgs.quest === 'string') {
            tArgs.quest = t(`quest_${tArgs.quest}`);
        }
        if (tArgs.loot && typeof tArgs.loot === 'object') {
            tArgs.loot = renderMessage(tArgs.loot);
        }

        return t(key, tArgs);
    };

    return (
        <div>
            <h2>{t('campaign_map')}</h2>
            <div className="adventure-grid">
                <div className="card">
                    <h3>{t('missions')}</h3>
                    {GameLogic.QUESTS.map(q => (
                        <div key={q.id}
                            className={`quest-item ${selectedQuest === q.id ? 'selected' : ''}`}
                            onClick={() => onSelectQuest(q.id)}>
                            <h4>{t(`quest_${q.id}`)} (Lvl {formatNumber(q.level)})</h4>
                            <p>{t(`quest_${q.id}_desc`)}</p>
                            <small>{t('risk')}: {formatNumber(q.risk)} | {t('reward')}: {formatNumber(q.reward)}g</small>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h3>{t('select_hero')}</h3>
                    {heroes.map(h => (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderRadius: '4px', background: h.hp <= 5 ? '#fdd' : '#eee', marginBottom: '5px' }}>
                            <span>{h.name} (Str: {h.str})</span>
                            <button className="btn" disabled={h.hp <= 5 || !selectedQuest} onClick={() => onGoAdventure(h.id, selectedQuest)}>
                                {t('send_hero')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="card" style={{ marginTop: '20px', borderColor: '#d32f2f' }}>
                <h3 style={{ color: '#d32f2f' }}>{t('boss_hydra')}</h3>
                <p>{t('boss_desc')}</p>
                <button className="btn" style={{ background: '#d32f2f', color: 'white' }} onClick={onFightBoss}>{t('boss_fight')}</button>
            </div>

            {/* Combat Log */}
            <div className="card" style={{ marginTop: '20px', background: '#333', color: '#fff', maxHeight: '200px', overflowY: 'auto' }}>
                <h3 style={{ color: '#fff', borderBottom: '1px solid #555' }}>Combat Log</h3>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {combatLog && combatLog.map((entry, i) => (
                        <div key={i} style={{ borderBottom: '1px solid #444', padding: '2px 0' }}>
                            <span style={{ color: '#888', marginRight: '8px' }}>[{new Date(entry.time).toLocaleTimeString()}]</span>
                            {renderMessage(entry.msg)}
                        </div>
                    ))}
                    {(!combatLog || combatLog.length === 0) && <div style={{ color: '#666', fontStyle: 'italic' }}>...</div>}
                </div>
            </div>
        </div>
    );
};

export default AdventureView;
