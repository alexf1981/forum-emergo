import React from 'react';

const UnifiedText = ({
    children,
    variant = 'body', // h1, h2, body, caption
    color = 'default', // default (inherit), gold, light, dark, success, danger
    align = 'left',
    style = {},
    uppercase = false,
    noWrap = false,
    className = ''
}) => {

    // Base styles map
    const styles = {
        h1: {
            fontFamily: 'Trajan Pro, serif',
            fontSize: 'clamp(1.5rem, 5vw, 2.4rem)',
            marginBottom: '0.5rem',
            lineHeight: 1.2
        },
        h2: {
            fontFamily: 'Trajan Pro, serif',
            fontSize: '1.2rem',
            marginBottom: '0.5rem',
            lineHeight: 1.2
        },
        body: {
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '1rem',
            lineHeight: 1.5,
            marginBottom: '0.5rem'
        },
        caption: {
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '0.8rem',
            lineHeight: 1.4,
            opacity: 0.8
        }
    };

    // Color map
    const colors = {
        gold: '#f1c40f',
        light: '#ecf0f1',
        dark: '#2c3e50',
        success: '#27ae60',
        danger: '#c0392b',
        default: 'inherit'
    };

    const computedStyle = {
        ...styles[variant],
        color: colors[color] || color, // Allow custom hex overrides
        textAlign: align,
        textTransform: uppercase || variant.startsWith('h') ? 'uppercase' : 'none',
        whiteSpace: noWrap ? 'nowrap' : 'normal',
        margin: 0, // Reset margin by default, easy to override with style or className
        ...style
    };

    // Use appropriate HTML tag
    const Tag = variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : 'p';

    return (
        <Tag className={className} style={computedStyle}>
            {children}
        </Tag>
    );
};

export default UnifiedText;
