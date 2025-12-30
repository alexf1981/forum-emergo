const { React } = window;
const { useState } = React;

function AddTaskModal({ onClose, onAdd }) {
    const [text, setText] = useState('');
    const [type, setType] = useState('virtue');
    const [isRecurring, setIsRecurring] = useState(false);
    const today = new Date().toLocaleDateString('nl-NL');

    const handleTypeChange = (newType) => {
        setType(newType);
        if (newType === 'todo') {
            setIsRecurring(false);
        }
    };

    const handleSubmit = (e, keepOpen = false) => {
        if (e) e.preventDefault();
        if (!text) return;
        // bucket (one-time) is the inverse of isRecurring
        onAdd(text, type, !isRecurring);

        if (keepOpen) {
            setText('');
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="scroll-modal" onClick={e => e.stopPropagation()}>
                <div className="scroll-inner">
                    <h2 className="scroll-title">Nieuwe taak toevoegen</h2>

                    <div className="scroll-form">
                        <div className="scroll-field">
                            <label>Omschrijving:</label>
                            <input
                                type="text"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.keyCode === 13) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
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
                                    onChange={e => handleTypeChange(e.target.value)}
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
                                    onChange={e => handleTypeChange(e.target.value)}
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
                                    onChange={e => handleTypeChange(e.target.value)}
                                />
                                <span className="radio-dot dot-blue"></span>
                                Mandatum
                            </label>
                        </div>

                        <div className="scroll-field checkbox-field">
                            <label className={`scroll-checkbox-item ${type === 'todo' ? 'disabled' : ''}`} style={type === 'todo' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={e => setIsRecurring(e.target.checked)}
                                    disabled={type === 'todo'}
                                />
                                <span className="checkbox-box recurring-circle"></span>
                                Repeterend?
                            </label>
                        </div>

                        <div className="scroll-actions">
                            <button type="button" className="btn-scroll cancel" onClick={onClose}>ANNULEER</button>
                            <button type="button" className="btn-scroll" onClick={() => handleSubmit(null, true)}>OK & NIEUWE</button>
                            <button type="button" className="btn-scroll ok" onClick={() => handleSubmit(null, false)}>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.AddTaskModal = AddTaskModal;
