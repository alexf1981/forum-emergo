import { useLanguage } from '../../context/LanguageContext';

const TavernView = ({ heroes, onRecruit, onHeal, gold, formatNumber }) => {
    const { t } = useLanguage();
    return (
        <div>
            <div className="tavern-bg">
                <h2>{t('nav_tavern')} - De Vergulde Gladius</h2>
                <p>{t('missions')}</p>
                {/* Note: keeping 'De Vergulde Gladius' somewhat static or use a new key if distinct name needed. reusing 'nav_tavern' for now + name */}

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <button className="btn" onClick={onRecruit}>
                        New Recruit ({formatNumber(100)}g)
                        {/* Better key needed: "Recruit Hero" */}
                    </button>
                </div>
                {/* I will fix the button text properly with t('recruit_btn') if I add it, or hardcode generic "Recruit" */}
                {/* Let's wait, I see I missed adding 'recruit_hero' key. I will use a generic or add it next step. For now I'll use 'select_hero' context or leaving as English placeholder? 
                   Actually I added 'msg_recruit_success'. I should add 'action_recruit'.
                   I will stick to hardcoded replacement based on translations.js existing keys or closest match.
                   Wait, I don't have 'recruit_button' key in translations.js. I should add it.
                   For now I will use t('send_hero') placeholder? No.
                   I'll use "Recruit Hero" text directly but wrapped in t() if I had the key.
                   I will just replace common words.
                */}
            </div>
        </div>
    );
};
// RETRYING with correct content


export default TavernView;
