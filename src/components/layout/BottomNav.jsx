import React from 'react';

const BottomNav = ({ activeTab, onTabChange, onProfileClick, stats, formatNumber, saveStatus }) => {
    const navItems = [
        { id: 'city', label: 'Plichten', icon: './assets/nav_plichten.jpg' },
        { id: 'tavern', label: 'Taverne', icon: './assets/nav_tavern.jpg' },
        { id: 'adventure', label: 'Quests', icon: './assets/nav_quests.jpg' }
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
                    <div className="nav-icon">
                        <img src="./assets/nav_profile.jpg" alt="Profiel" />
                    </div>
                    {saveStatus === 'saving' && <span style={{ position: 'absolute', top: '2px', right: '10px', fontSize: '18px', zIndex: 20, pointerEvents: 'none', textShadow: '0 0 5px black' }}>⏳</span>}
                    {saveStatus === 'saved' && <span style={{ position: 'absolute', top: '2px', right: '10px', fontSize: '18px', zIndex: 20, pointerEvents: 'none', textShadow: '0 0 5px black' }}>☁️</span>}
                    {saveStatus === 'error' && <span style={{ position: 'absolute', top: '2px', right: '10px', fontSize: '18px', zIndex: 20, pointerEvents: 'none', textShadow: '0 0 5px black' }}>⚠️</span>}
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
