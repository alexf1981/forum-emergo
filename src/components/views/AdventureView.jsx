import React from 'react';
import * as GameLogic from '../../logic/gameLogic';

import { useLanguage } from '../../context/LanguageContext';

const AdventureView = ({ heroes, selectedQuest, onSelectQuest, onGoAdventure, onFightBoss, formatNumber }) => {
    const { t } = useLanguage();

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
        </div>
    );
};

export default AdventureView;
