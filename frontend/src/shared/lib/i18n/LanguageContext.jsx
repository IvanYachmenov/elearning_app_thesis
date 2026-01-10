import {createContext, useContext, useState, useEffect} from 'react';

const translations = {
    en: {
        nav: {
            home: 'Home',
            courses: 'Courses',
            learning: 'Learning',
            shop: 'Shop',
            profile: 'Profile',
            settings: 'Settings',
            logout: 'Logout',
            menu: 'Menu',
            myCourses: 'My Courses'
        },
        common: {
            loading: 'Loading...',
            error: 'Error',
            back: 'Back'
        },
        pages: {
            courses: {
                title: 'Courses',
                subtitle: 'Browse available courses. After you enroll, they will appear on the Learning page.',
                viewDetails: 'View details →',
                noCourses: 'No courses available yet. Check back soon!',
                loading: 'Loading courses...'
            },
            learning: {
                title: 'My Learning',
                subtitle: 'Courses you\'re currently enrolled in',
                continueLearning: 'Continue learning →',
                noCourses: 'No courses yet',
                noCoursesText: 'You haven\'t enrolled in any courses. Browse our catalog to get started!',
                exploreCourses: 'Explore courses'
            },
            settings: {
                title: 'Settings',
                theme: 'Theme',
                lightTheme: 'Light',
                darkTheme: 'Dark',
                language: 'Language',
                english: 'English',
                slovak: 'Slovak'
            },
            shop: {
                title: 'Shop',
                subtitle: 'Purchase courses and materials'
            },
            home: {
                title: 'Home',
                subtitle: 'Welcome to the learning system'
            },
            teacher: {
                title: 'My Courses',
                subtitle: 'Manage your courses',
                createCourse: 'Create New Course',
                noCourses: 'You haven\'t created any courses yet.',
                createFirst: 'Create Your First Course'
            }
        }
    },
    sk: {
        nav: {
            home: 'Domov',
            courses: 'Kurzy',
            learning: 'Vzdelávanie',
            shop: 'Obchod',
            profile: 'Profil',
            settings: 'Nastavenia',
            logout: 'Odhlásiť sa',
            menu: 'Menu',
            myCourses: 'Moje kurzy'
        },
        common: {
            loading: 'Načítavanie...',
            error: 'Chyba',
            back: 'Späť'
        },
        pages: {
            courses: {
                title: 'Kurzy',
                subtitle: 'Prehľadajte dostupné kurzy. Po prihlásení sa objavia na stránke Vzdelávanie.',
                viewDetails: 'Zobraziť detaily →',
                noCourses: 'Zatiaľ nie sú k dispozícii žiadne kurzy. Skúste to neskôr!',
                loading: 'Načítavanie kurzov...'
            },
            learning: {
                title: 'Moje vzdelávanie',
                subtitle: 'Kurzy, na ktoré ste prihlásení',
                continueLearning: 'Pokračovať v učení →',
                noCourses: 'Zatiaľ žiadne kurzy',
                noCoursesText: 'Ešte ste sa neprihlásili na žiadne kurzy. Prehľadajte náš katalóg a začnite!',
                exploreCourses: 'Preskúmať kurzy →'
            },
            settings: {
                title: 'Nastavenia',
                theme: 'Téma',
                lightTheme: 'Svetlá',
                darkTheme: 'Tmavá',
                language: 'Jazyk',
                english: 'Angličtina',
                slovak: 'Slovenčina'
            },
            shop: {
                title: 'Obchod',
                subtitle: 'Nákup kurzov a materiálov'
            },
            home: {
                title: 'Domov',
                subtitle: 'Vitajte v systéme vzdelávania'
            },
            teacher: {
                title: 'Moje kurzy',
                subtitle: 'Spravujte svoje kurzy',
                createCourse: 'Vytvoriť nový kurz',
                noCourses: 'Ešte ste nevytvorili žiadne kurzy.',
                createFirst: 'Vytvorte svoj prvý kurz'
            }
        }
    }
};

const LanguageContext = createContext();

export function LanguageProvider({children}) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return saved || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{language, setLanguage, t}}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
