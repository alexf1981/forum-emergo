import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const CityVisual = ({ rank, score, population, playerName }) => {
    const { t } = useLanguage();
    let imageSrc = './assets/city_village.png';
    // Population-based evolution
    if (population >= 1000) imageSrc = './assets/city_town.png';
    if (population >= 25000) imageSrc = './assets/city_capital.png';
    // Rank Caption based on Population
    let rankKey = 'rank_0';
    if (population >= 1000) rankKey = 'rank_1';
    if (population >= 10000) rankKey = 'rank_2';
    if (population >= 25000) rankKey = 'rank_3';
    if (population >= 75000) rankKey = 'rank_4';

    return (
        <div className="city-visual-container">
            <img src={imageSrc} alt={`Stad status: ${t(rankKey)}`} className="city-image" />
            <div className="city-name-badge">{playerName}</div>
            <div className="city-rank-badge">{t(rankKey)}</div>
        </div>
    );
};

export default CityVisual;
