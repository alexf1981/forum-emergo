import { useState, useCallback } from 'react';

// Mock data for initial V1 visualization
const INITIAL_BUILDINGS = [
    { id: 'town_hall', type: 'town_hall', level: 1, x: 50, y: 30, name: 'Stadhuis' },
    { id: 'tavern', type: 'tavern', level: 1, x: 20, y: 60, name: 'Taverne' },
    { id: 'house_1', type: 'house', level: 1, x: 70, y: 65, name: 'Woonhuis' },
    { id: 'house_2', type: 'house', level: 1, x: 60, y: 75, name: 'Woonhuis' },
    { id: 'library', type: 'library', level: 1, x: 80, y: 40, name: 'Bibliotheek' },
    { id: 'market', type: 'market', level: 1, x: 35, y: 70, name: 'Markt' },
];

export const useCity = () => {
    const [buildings, setBuildings] = useState(INITIAL_BUILDINGS);
    const [resources, setResources] = useState({
        wood: 100,
        stone: 50
    });

    const getBuilding = useCallback((type) => {
        return buildings.find(b => b.type === type);
    }, [buildings]);

    const buildBuilding = (type, x, y) => {
        // Logic to add a new building
        console.log(`Building ${type} at ${x}, ${y}`);

        // Check limits (e.g. max 10 houses)
        if (type === 'house') {
            const houseCount = buildings.filter(b => b.type === 'house').length;
            if (houseCount >= 10) {
                alert("Maximaal 10 huizen!");
                return;
            }
        }

        const newBuilding = {
            id: `${type}_${Date.now()}`,
            type: type,
            level: 1,
            x: x,
            y: y,
            name: type === 'house' ? 'Woonhuis' : 'Gebouw'
        };

        setBuildings(prev => [...prev, newBuilding]);
    };

    const upgradeBuilding = (id) => {
        setBuildings(prev => prev.map(b => {
            if (b.id === id) {
                return { ...b, level: b.level + 1 };
            }
            return b;
        }));
    };

    return {
        buildings,
        resources,
        getBuilding,
        buildBuilding,
        upgradeBuilding
    };
};
