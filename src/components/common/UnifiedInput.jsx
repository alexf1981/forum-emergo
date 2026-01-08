import React from 'react';
import UnifiedText from './UnifiedText';

const UnifiedInput = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    fullWidth = false,
    error = null,
    style = {},
    containerStyle = {},
    min,
    max,
    id,
    ...props
}) => {
    // Note: fullWidth destructuring moved into props definition above to avoid passing it to div if we were spreading on div, 
    // but here we spread on input. Wait, `fullWidth` is used in containerStyle.

    // Better signature: extract standard props, split rest.
    // ...props will capture onBlur, required, name, autoComplete, etc.

    const finalContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '10px',
        ...containerStyle
    };

    const inputStyle = {
        padding: '10px',
        borderRadius: '4px',
        border: error ? '1px solid #e74c3c' : '1px solid #bdc3c7',
        fontSize: '1rem',
        fontFamily: '"Times New Roman", Times, serif',
        outline: 'none',
        background: 'rgba(255, 255, 255, 0.9)',
        width: '100%',
        boxSizing: 'border-box',
        ...style
    };

    return (
        <div style={finalContainerStyle}>
            {label && (
                <label htmlFor={id} style={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: '#2c3e50',
                    fontFamily: 'Trajan Pro, serif'
                }}>
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={inputStyle}
                min={min}
                max={max}
                {...props}
            />
            {error && (
                <UnifiedText variant="caption" color="danger">
                    {error}
                </UnifiedText>
            )}
        </div>
    );
};

export default UnifiedInput;
