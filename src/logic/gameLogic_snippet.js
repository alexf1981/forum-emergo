
export const getBuildingBenefit = (type, level) => {
    if (level === 0) return "-";

    switch (type) {
        case 'town_hall':
            const mult = TOWN_HALL_MULTIPLIERS[level] || 1;
            const reward = BASE_TASK_GOLD * mult;
            // Use k format for large numbers if implementing logic here, or just raw
            return `Taakbeloning: ${reward}g`;
        case 'house':
            const pop = POPULATION_PER_LEVEL[level] || 0;
            return `Bevolking: ${pop}`;
        case 'library':
            const caps = RESEARCH_CAPS[level];
            if (!caps) return "Geen onderzoek";
            return `Max Tax: ${caps.tax} / Bank: ${caps.interest}`;
        case 'market':
            if (level === 1) return "Handel Vrijgespeeld";
            return "Betere prijzen";
        case 'tavern':
            if (level === 1) return "Helden Vrijgespeeld";
            return "Betere helden";
        default:
            return "-";
    }
};
