const { React } = window;
const { useState } = React;

function AddTaskModal({ onClose, onAdd }) {
    const [text, setText] = useState('');
    const [type, setType] = useState('virtue');
    const [isOneTime, setIsOneTime] = useState(false);
    const today = new Date().toLocaleDateString('nl-NL');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text) return;
        onAdd(text, type, isOneTime);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="scroll-modal" onClick={e => e.stopPropagation()}>
                <div className="scroll-inner">
                    <h2 className="scroll-title">Nieuwe taak toevoegen</h2>

                    <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="scroll-form">
                        <div className="scroll-field">
                            <label>Omschrijving:</label>
                            <input
                                type="text"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="scroll-field">
                            <label>Aangemaakt:</label>
                            <div className="date-display">{today}</div>
                        </div>

                        <div className="scroll-radio-group">
                            <label className="scroll-radio-item">
                                <input
                                    type="radio"
                                    name="type"
                                    value="virtue"
                                    checked={type === 'virtue'}
                                    onChange={e => setType(e.target.value)}
                                />
                                <span className="radio-dot dot-green"></span>
                                Virtus
                            </label>
                            <label className="scroll-radio-item">
                                <input
                                    type="radio"
                                    name="type"
                                    value="vice"
                                    checked={type === 'vice'}
                                    onChange={e => setType(e.target.value)}
                                />
                                <span className="radio-dot dot-red"></span>
                                Barbarium
                            </label>
                            <label className="scroll-radio-item">
                                <input
                                    type="radio"
                                    name="type"
                                    value="todo"
                                    checked={type === 'todo'}
                                    onChange={e => setType(e.target.value)}
                                />
                                <span className="radio-dot dot-blue"></span>
                                Mandatum
                            </label>
                        </div>

                        <div className="scroll-field checkbox-field">
                            <label className="scroll-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={isOneTime}
                                    onChange={e => setIsOneTime(e.target.checked)}
                                />
                                <span className="checkbox-box"></span>
                                Repeterend?
                            </label>
                        </div>

                        <div className="scroll-actions">
                            <button type="button" className="btn-scroll cancel" onClick={onClose}>ANNULEER</button>
                            <button type="submit" className="btn-scroll ok">OK</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

window.AddTaskModal = AddTaskModal;
