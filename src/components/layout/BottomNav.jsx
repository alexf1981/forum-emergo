import { useLanguage } from '../../context/LanguageContext';

const BottomNav = ({ activeTab, onTabChange, onProfileClick, stats, formatNumber, saveStatus, isLoggedIn }) => {
    const { t } = useLanguage();

    // We construct navItems inside render or memo so 't' is fresh
    const navItems = [
        { id: 'city', label: t('nav_city'), icon: './assets/nav_plichten.jpg' },
        { id: 'tavern', label: t('nav_tavern'), icon: './assets/nav_tavern.jpg' },
        { id: 'adventure', label: t('nav_adventure'), icon: './assets/nav_quests.jpg' }
    ];

    return (
        <div className="bottom-nav">
            <div className="bottom-nav-content">
                <div className="nav-item stat-item edge-item">
                    <div className="nav-icon">
                        <img src="./assets/nav_gold.jpg" alt="Goud" />
                        <span className="nav-value">{stats.gold}</span>
                    </div>
                </div>

                <div className="nav-group-center">
                    {navItems.map(item => {
                        const navOrder = ['city', 'tavern', 'adventure'];
                        const activeIdx = navOrder.indexOf(activeTab);
                        const itemIdx = navOrder.indexOf(item.id);
                        const diff = (itemIdx - activeIdx + 3) % 3;

                        let role = 'center';
                        if (diff === 1) role = 'right';
                        if (diff === 2) role = 'left';

                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''} role-${role}`}
                                onClick={() => onTabChange(item.id)}
                                title={item.label}
                            >
                                <div className={`nav-icon ${role === 'center' ? 'large' : ''}`}>
                                    <img src={item.icon} alt={item.label} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button className="nav-item edge-item" onClick={(e) => { e.stopPropagation(); onProfileClick(); }} title="Profiel">
                    <div className="nav-icon" style={{ position: 'relative' }}>
                        <img src="./assets/nav_profile.jpg" alt="Profiel" />

                        {/* Sync Status Dot */}
                        <div style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: '2px solid #000000', // Black border for high contrast
                            zIndex: 20,
                            boxShadow: '0 0 4px rgba(0,0,0,0.8)',
                            backgroundColor: !isLoggedIn ? '#ecf0f1' : // White/Light Grey (Local)
                                (saveStatus === 'error') ? '#ff1744' : // Bright Red (Error)
                                    (saveStatus === 'saved') ? '#00e676' : // Bright Green (Saved)
                                        '#ffd700' // Gold/Yellow (Syncing)
                        }} title={!isLoggedIn ? "Lokaal Opslaan" : (saveStatus === 'saved' ? "Gesynchroniseerd" : "Aan het synchroniseren...")} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
