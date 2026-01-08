import React from 'react';

const UnifiedCard = ({
    children,
    variant = 'papyrus', // papyrus, glass, outline
    padding = '20px',
    style = {},
    className = '',
    onClick
}) => {

    const baseStyle = {
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        padding: padding,
        transition: 'transform 0.2s, box-shadow 0.2s',
        ...style
    };

    const variants = {
        papyrus: {
            backgroundImage: 'url("/assets/papyrus.jpg")',
            backgroundSize: 'cover',
            border: '1px solid #d4c5a3',
            boxShadow: '5px 5px 15px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.1)'
        },
        glass: {
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff'
        },
        outline: {
            background: 'transparent',
            border: '1px dashed #7f8c8d',
            color: 'inherit'
        }
    };

    const computedStyle = {
        ...baseStyle,
        ...variants[variant]
    };

    return (
        <div
            className={`unified-card ${className}`}
            style={computedStyle}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default UnifiedCard;
