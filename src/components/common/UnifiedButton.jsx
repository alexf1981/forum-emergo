import React from 'react';
import Icons from '../Icons'; // Assuming Icons are centrally available

const UnifiedButton = ({
    children,
    onClick,
    variant = 'primary', // primary, secondary, danger, success, icon
    size = 'md', // sm, md, lg
    disabled = false,
    icon = null, // Optional Icon component
    style = {},
    className = '',
    fullWidth = false,
    type = 'button'
}) => {

    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Trajan Pro, serif',
        textTransform: 'uppercase',
        transition: 'all 0.2s',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...style
    };

    // Size variants
    const sizes = {
        sm: { padding: '4px 8px', fontSize: '0.8rem' },
        md: { padding: '8px 16px', fontSize: '1rem' },
        lg: { padding: '12px 24px', fontSize: '1.2rem' }
    };

    // Color variants
    const variants = {
        primary: {
            background: 'linear-gradient(to bottom, #34495e, #2c3e50)', // Dark Blue Gradient
            color: '#ffffff', // White text for contrast
            border: '1px solid #1a252f',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        },
        secondary: {
            background: '#95a5a6',
            color: '#fff',
            border: '1px solid #7f8c8d'
        },
        danger: {
            background: '#e74c3c',
            color: '#fff',
            border: '1px solid #c0392b'
        },
        success: {
            background: '#2ecc71',
            color: '#fff',
            border: '1px solid #27ae60'
        },
        icon: {
            background: 'transparent',
            color: 'inherit',
            padding: '4px',
            fontSize: '1.2rem',
            boxShadow: 'none'
        }
    };

    // Standard Widths
    const stdWidths = {
        sm: '80px',
        md: '140px',
        lg: '200px'
    };

    const computedStyle = {
        ...baseStyle,
        ...sizes[size],
        ...variants[variant],
        // Width Logic: FullWidth > Icon (Auto) > Standard Fixed Width
        width: fullWidth ? '100%' : (variant === 'icon' ? 'auto' : stdWidths[size]),
        // Icon override
        ...(variant === 'icon' ? { padding: '4px' } : {})
    };

    return (
        <button
            type={type}
            className={className}
            style={computedStyle}
            onClick={onClick}
            disabled={disabled}
            title={typeof children === 'string' ? children : ''} // Tooltip for truncated text
        >
            {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
            <span style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
            }}>
                {children}
            </span>
        </button>
    );
};

export default UnifiedButton;
