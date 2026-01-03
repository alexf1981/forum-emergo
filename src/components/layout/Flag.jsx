import React from 'react';

const Flag = ({ code, className, style }) => {
    const getSize = () => ({ width: '1.2em', height: '1.2em', display: 'inline-block', verticalAlign: 'middle', ...style });

    const normalizedCode = code ? code.toLowerCase().trim() : '';

    switch (normalizedCode) {
        case 'nl':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className} style={getSize()}>
                    <rect width="900" height="600" fill="#21468b" />
                    <rect width="900" height="400" fill="#fff" />
                    <rect width="900" height="200" fill="#ae1c28" />
                </svg>
            );
        case 'de':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className} style={getSize()}>
                    <rect width="5" height="3" y="0" x="0" fill="#000" />
                    <rect width="5" height="2" y="1" x="0" fill="#d00" />
                    <rect width="5" height="1" y="2" x="0" fill="#ffce00" />
                </svg>
            );
        case 'en':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className} style={getSize()}>
                    <clipPath id="t">
                        <path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z" />
                    </clipPath>
                    <path d="M0,0v30h60v-30z" fill="#00247d" />
                    <path d="M0,0L60,30M60,0L0,30" stroke="#fff" strokeWidth="6" />
                    <path d="M0,0L60,30M60,0L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4" />
                    <path d="M30,0v30M0,15h60" stroke="#fff" strokeWidth="10" />
                    <path d="M30,0v30M0,15h60" stroke="#cf142b" strokeWidth="6" />
                </svg>
            );
        case 'es':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" className={className} style={getSize()}>
                    <rect width="750" height="500" fill="#c60b1e" />
                    <rect width="750" height="250" y="125" fill="#ffc400" />
                </svg>
            );
        default:
            return <span>{code}</span>;
    }
};

export default Flag;
