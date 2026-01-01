import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../locales/translations';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to English, or load from local storage
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('rome_language') || 'en';
    });

    const { user } = useAuth();

    // Load language from profile when user logs in
    useEffect(() => {
        if (user) {
            const fetchProfileLang = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('language')
                    .eq('id', user.id)
                    .single();

                if (data && data.language && translations[data.language]) {
                    setLanguage(data.language);
                    localStorage.setItem('rome_language', data.language);
                }
            };
            fetchProfileLang();
        }
    }, [user]);

    const changeLanguage = async (newLang) => {
        if (!translations[newLang]) return;

        setLanguage(newLang);
        localStorage.setItem('rome_language', newLang);

        // If logged in, save to profile
        if (user) {
            await supabase
                .from('profiles')
                .update({ language: newLang })
                .eq('id', user.id);
        }
    };

    const t = (key, args = {}) => {
        const langDict = translations[language] || translations['en'];
        let text = langDict[key] || key;

        // Interpolate variables: {name} -> args.name
        if (args) {
            Object.keys(args).forEach(argKey => {
                text = text.replace(new RegExp(`{${argKey}}`, 'g'), args[argKey]);
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, languages: Object.keys(translations) }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
