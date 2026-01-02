import { useState, useCallback } from 'react';

// Mock data for initial V1 visualization
const INITIAL_BUILDINGS = [
    {
        "id": "town_hall",
        "type": "town_hall",
        "x": 50,
        "y": 41,
        "name": "Stadhuis",
        "level": 1
    },
    {
        "id": "tavern",
        "type": "tavern",
        "x": 74,
        "y": 46,
        "name": "Taverne",
        "level": 1
    },
    {
        "id": "house_1",
        "type": "house",
        "x": 62,
        "y": 52,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_2",
        "type": "house",
        "x": 29,
        "y": 58,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "library",
        "type": "library",
        "x": 36,
        "y": 38,
        "name": "Bibliotheek",
        "level": 1
    },
    {
        "id": "market",
        "type": "market",
        "x": 42,
        "y": 61,
        "name": "Markt",
        "level": 1
    },
    {
        "id": "house_1767357972907",
        "type": "house",
        "x": 52,
        "y": 68,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357973099",
        "type": "house",
        "x": 79,
        "y": 74,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357973267",
        "type": "house",
        "x": 20,
        "y": 36,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357973411",
        "type": "house",
        "x": 27,
        "y": 30,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357973595",
        "type": "house",
        "x": 33,
        "y": 75,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357973771",
        "type": "house",
        "x": 27,
        "y": 41,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357973931",
        "type": "house",
        "x": 19,
        "y": 55,
        "name": "Woonhuis",
        "level": 1
    },
    {
        "id": "house_1767357974083",
        "type": "house",
        "x": 71,
        "y": 59,
        "name": "Woonhuis",
        "level": 1
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
