import { useLanguage } from '../../../context/LanguageContext';
import * as GameLogic from '../../../logic/gameLogic';

const TownHallInterior = ({ onClose, buildings, buildBuilding, resources, stats }) => {
    const { t } = useLanguage();

    // Helper to check if a specific type can be built (is there an empty slot?)
    const canBuild = (type) => {
        return buildings.some(b => b.type === type && b.level === 0);
    };

    // Helper to check if already built (for uniques)
    const isBuilt = (type) => {
        if (type === 'house') return false; // Houses are never "fully built" until all slots taken
        return buildings.some(b => b.type === type && b.level > 0);
    };

    const getHouseStatus = () => {
        const total = buildings.filter(b => b.type === 'house').length;
        const built = buildings.filter(b => b.type === 'house' && b.level > 0).length;
        return `${built}/${total} ${t('msg_built')}`;
    };

    const handleBuild = (type) => {
        if (canBuild(type)) {
            buildBuilding(type);
            // Optional: Close modal or show success?
            // onClose(); 
        } else {
            alert('Geen ruimte meer of al gebouwd!');
        }
    };

    const BuildingOption = ({ type, name, cost, imagePath }) => {
        const available = canBuild(type);
        const built = isBuilt(type);

        let statusText;
        let isCompleted;

        if (type === 'house') {
            const hasSpace = canBuild('house');
            isCompleted = !hasSpace;
            statusText = isCompleted ? t('lbl_completed') : '';
        } else {
            isCompleted = built;
            statusText = isCompleted ? t('lbl_completed') : '';
        }

        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap', // Allow wrapping on small screens
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.6)', // Lighter background for readability
                marginBottom: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(139, 69, 19, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 auto' }}>
                    <img
                        src={imagePath}
                        alt={name}
                        style={{
                            width: '50px',
                            height: 'auto',
                            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000' }}>
                            {name} {type === 'house' && <span style={{ fontSize: '0.8rem', color: '#333' }}>({getHouseStatus()})</span>}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: '500' }}>
                            {statusText}
                        </div>
                    </div>
                </div>
                {(() => {
                    const numericCost = GameLogic.getDynamicBuildingCost(type, buildings);
                    const canAfford = stats.gold >= numericCost;
                    const isLocked = !available; // No space or max level global logic

                    // If completed (Max houses built or unique built) -> Grey and "Voltooid" (actually isCompleted logic handles this)
                    // If available space -> Check Afford

                    // We use simplified logic:
                    // Color: Green if (available AND canAfford), Grey otherwise
                    const isGreen = available && canAfford && !isCompleted;

                    return (
                        <button
                            className="btn primary-btn-bounce"
                            onClick={() => handleBuild(type)}
                            disabled={isCompleted}
                            style={{
                                padding: '8px 16px',
                                background: isGreen ? '#27ae60' : '#7f8c8d',
                                opacity: (isCompleted || !available) ? 0.6 : (canAfford ? 1 : 0.6),
                                cursor: isCompleted ? 'not-allowed' : 'pointer', // Clickable if poor for toast
                                border: '1px solid #fff',
                                borderRadius: '4px',
                                color: 'white',
                                fontWeight: 'bold',
                                boxShadow: isGreen ? '0 2px 5px rgba(0,0,0,0.5)' : 'none',
                                flex: '0 0 auto',
                                marginLeft: 'auto',
                                minWidth: '120px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isCompleted ? (
                                <span>{t('lbl_completed')}</span>
                            ) : (
                                <>
                                    <span>🪙</span>
                                    <span>{numericCost}</span>
                                </>
                            )}
                        </button>
                    );
                })()}
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', color: '#3e2723' }}>
            {/* Header line only, no text */}
            <div style={{
                borderBottom: '2px solid #8b4513',
                marginBottom: '20px',
                paddingBottom: '10px'
            }}></div>

            <p style={{ marginBottom: '20px', fontStyle: 'italic', fontWeight: 'bold' }}>
                {t('msg_town_hall_intro')}
            </p>

            <div className="building-options">
                <BuildingOption
                    type="house"
                    name={t('building_house')}
                    cost={GameLogic.BUILDING_COSTS.house}
                    imagePath="./assets/city/house.png"
                />
                <BuildingOption
                    type="tavern"
                    name={t('building_tavern')}
                    cost={GameLogic.BUILDING_COSTS.tavern}
                    imagePath="./assets/city/tavern.png"
                />
                <BuildingOption
                    type="library"
                    name={t('building_library')}
                    cost={GameLogic.BUILDING_COSTS.library}
                    imagePath="./assets/city/library.png"
                />
                <BuildingOption
                    type="market"
                    name={t('building_market')}
                    cost={GameLogic.BUILDING_COSTS.market}
                    imagePath="./assets/city/market.png"
                />
            </div>
        </div>
    );
};

export default TownHallInterior;
