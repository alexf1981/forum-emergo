import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HeroBanner from './layout/HeroBanner';
import '../../css/components.css';

const WelcomeModal = ({ onLogin, onRegister, onPlayLocal }) => {
    const { t } = useLanguage();

    return (
        <div className="modal-overlay" style={{
            zIndex: 3000,
            backgroundImage: 'url("./assets/city_capital.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', // Fallback / Tint
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Shared Hero Banner (Fixed Position inherited from CSS class) */}
            {/* We add zIndex to ensure it sits above the background overlay if needed, though standard class is z-index: 2000 */}
            {/* The modal overlay is 3000. So we need to boost the banner to visible. */}
            <HeroBanner style={{ zIndex: 3001 }} />

            <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center', padding: '0', overflow: 'hidden', marginTop: '120px' }}>
                <div style={{ padding: '30px' }}>
                    <p style={{ fontStyle: 'italic', marginBottom: '25px', fontSize: '1.2em', color: '#555' }}>
                        "Ave Keizer! Betreed Forum Emergo. Versterk je gewoontes. Vorm je rijk."
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Heb je al een account?</p>
                            <button className="btn full-width" onClick={onLogin}>Inloggen</button>
                        </div>

                        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Wil je een nieuw account maken?</p>
                            <button className="btn full-width" onClick={onRegister}>Registreren</button>
                        </div>


                        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Wil je spelen zonder account?</p>
                            <button className="btn full-width" onClick={onPlayLocal}>Spelen zonder account</button>
                            <p style={{ fontSize: '0.85em', color: '#666', marginTop: '8px' }}>
                                Je kan altijd later nog een account aanmaken om je voortgang veilig op te slaan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
