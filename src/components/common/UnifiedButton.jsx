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
            background: 'linear-gradient(to bottom, #f1c40f, #f39c12)',
            color: '#2c3e50',
            border: '1px solid #d35400',
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

    const computedStyle = {
        ...baseStyle,
        ...sizes[size],
        ...variants[variant],
        // If it's an icon button, override padding from size if explicitly mostly just an icon
        ...(variant === 'icon' ? { padding: '4px' } : {})
    };

    return (
        <button
            type={type}
            className={className}
            style={computedStyle}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
            {children}
        </button>
    );
};

export default UnifiedButton;
