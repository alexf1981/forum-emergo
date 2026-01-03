import { useState, useCallback } from 'react';

// Mock data for initial V1 visualization
const INITIAL_BUILDINGS = [
    {
        "id": "town_hall",
        "type": "town_hall",
        "x": 55,
        "y": 38,
        "name": "Stadhuis",
        "level": 1
    },
    {
        "id": "tavern",
        "type": "tavern",
        "x": 75,
        "y": 36,
        "name": "Taverne",
        "level": 0
    },
    {
        "id": "house_1",
        "type": "house",
        "x": 67,
        "y": 37,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_2",
        "type": "house",
        "x": 29,
        "y": 58,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "library",
        "type": "library",
        "x": 68,
        "y": 64,
        "name": "Bibliotheek",
        "level": 0
    },
    {
        "id": "market",
        "type": "market",
        "x": 42,
        "y": 52,
        "name": "Markt",
        "level": 0
    },
    {
        "id": "house_1767357972907",
        "type": "house",
        "x": 51,
        "y": 52,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357973099",
        "type": "house",
        "x": 41,
        "y": 35,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357973267",
        "type": "house",
        "x": 16,
        "y": 40,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357973411",
        "type": "house",
        "x": 28,
        "y": 31,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357973595",
        "type": "house",
        "x": 9,
        "y": 69,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357973771",
        "type": "house",
        "x": 26,
        "y": 45,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357973931",
        "type": "house",
        "x": 30,
        "y": 80,
        "name": "Woonhuis",
        "level": 0
    },
    {
        "id": "house_1767357974083",
        "type": "house",
        "x": 87,
        "y": 61,
        "name": "Woonhuis",
        "level": 0
    }
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

    const buildBuilding = (type) => {
        // Find the first unbuilt building of this type
        const slot = buildings.find(b => b.type === type && b.level === 0);

        if (!slot) {
            alert(`Geen ruimte meer voor ${type}!`);
            return;
        }

        console.log(`Building ${type} at pre-defined slot ${slot.id}`);

        setBuildings(prev => prev.map(b => {
            if (b.id === slot.id) {
                return { ...b, level: 1 };
            }
            return b;
        }));
    };

    const upgradeBuilding = (id) => {
        setBuildings(prev => prev.map(b => {
            if (b.id === id) {
                return { ...b, level: b.level + 1 };
            }
            return b;
        }));
    };

    const moveBuilding = (id, x, y) => {
        setBuildings(prev => prev.map(b => {
            if (b.id === id) {
                return { ...b, x, y };
            }
            return b;
        }));
    };

    return {
        buildings,
        resources,
        getBuilding,
        buildBuilding,
        upgradeBuilding,
        moveBuilding
    };
};
