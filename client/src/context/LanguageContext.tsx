import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
    [key: string]: {
        en: string;
        hi: string;
    };
}

const translations: Translations = {
    // Navigation
    'nav.home': { en: 'Home', hi: 'होम' },
    'nav.about': { en: 'About', hi: 'परिचय' },
    'nav.services': { en: 'Services', hi: 'सेवाएं' },
    'nav.doctors': { en: 'Doctors', hi: 'डॉक्टर' },
    'nav.contact': { en: 'Contact', hi: 'संपर्क' },
    'nav.login': { en: 'Login', hi: 'लॉग इन' },
    'nav.register': { en: 'Register', hi: 'पंजीकरण' },
    'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
    'nav.appointments': { en: 'Appointments', hi: 'अपॉइंटमेंट' },
    'nav.profile': { en: 'Profile', hi: 'प्रोफाइल' },
    'nav.logout': { en: 'Logout', hi: 'लॉग आउट' },

    // Home Page
    'home.title': { en: 'Your Health, Our Priority', hi: 'आपका स्वास्थ्य, हमारी प्राथमिकता' },
    'home.subtitle': { en: 'Experience world-class healthcare with cutting-edge technology', hi: 'अत्याधुनिक तकनीक के साथ विश्व स्तरीय स्वास्थ्य सेवा का अनुभव करें' },
    'home.bookAppointment': { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें' },
    'home.learnMore': { en: 'Learn More', hi: 'और जानें' },
    'home.emergencyCall': { en: 'Emergency? Call Now', hi: 'आपातकाल? अभी कॉल करें' },

    // Drug Interaction Checker
    'drug.title': { en: 'Drug Interaction Checker', hi: 'दवा इंटरैक्शन चेकर' },
    'drug.subtitle': { en: 'Check if your medicines are safe together', hi: 'जांचें कि आपकी दवाइयां एक साथ सुरक्षित हैं' },
    'drug.searchPlaceholder': { en: 'Search medicine...', hi: 'दवा खोजें...' },
    'drug.addMedicine': { en: 'Add Medicine', hi: 'दवा जोड़ें' },
    'drug.checkInteractions': { en: 'Check Interactions', hi: 'इंटरैक्शन जांचें' },
    'drug.noInteractions': { en: 'No Interactions Found', hi: 'कोई इंटरैक्शन नहीं मिला' },
    'drug.interactionsFound': { en: 'Interactions Found', hi: 'इंटरैक्शन पाए गए' },
    'drug.severe': { en: 'Severe', hi: 'गंभीर' },
    'drug.moderate': { en: 'Moderate', hi: 'मध्यम' },
    'drug.mild': { en: 'Mild', hi: 'हल्का' },
    'drug.recommendation': { en: 'Recommendation', hi: 'सिफारिश' },
    'drug.dosageTiming': { en: 'When to take', hi: 'कब लें' },
    'drug.sideEffects': { en: 'Side Effects', hi: 'दुष्प्रभाव' },
    'drug.dosageLimits': { en: 'Dosage Limits', hi: 'खुराक सीमा' },

    // Appointments
    'appt.book': { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें' },
    'appt.selectDoctor': { en: 'Select Doctor', hi: 'डॉक्टर चुनें' },
    'appt.selectDate': { en: 'Select Date', hi: 'तारीख चुनें' },
    'appt.selectTime': { en: 'Select Time', hi: 'समय चुनें' },
    'appt.confirm': { en: 'Confirm Booking', hi: 'बुकिंग पुष्टि करें' },
    'appt.pending': { en: 'Pending', hi: 'लंबित' },
    'appt.confirmed': { en: 'Confirmed', hi: 'पुष्ट' },
    'appt.completed': { en: 'Completed', hi: 'पूर्ण' },
    'appt.cancelled': { en: 'Cancelled', hi: 'रद्द' },

    // Common
    'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
    'common.error': { en: 'Something went wrong', hi: 'कुछ गलत हो गया' },
    'common.success': { en: 'Success!', hi: 'सफल!' },
    'common.save': { en: 'Save', hi: 'सहेजें' },
    'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
    'common.submit': { en: 'Submit', hi: 'जमा करें' },
    'common.search': { en: 'Search', hi: 'खोजें' },
    'common.filter': { en: 'Filter', hi: 'फ़िल्टर' },
    'common.viewAll': { en: 'View All', hi: 'सभी देखें' },
    'common.readMore': { en: 'Read More', hi: 'और पढ़ें' },

    // Auth
    'auth.phone': { en: 'Phone Number', hi: 'फोन नंबर' },
    'auth.email': { en: 'Email Address', hi: 'ईमेल पता' },
    'auth.password': { en: 'Password', hi: 'पासवर्ड' },
    'auth.otp': { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
    'auth.sendOtp': { en: 'Send OTP', hi: 'OTP भेजें' },
    'auth.verifyOtp': { en: 'Verify OTP', hi: 'OTP सत्यापित करें' },
    'auth.forgotPassword': { en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?' },
    'auth.noAccount': { en: "Don't have an account?", hi: 'अकाउंट नहीं है?' },
    'auth.haveAccount': { en: 'Already have an account?', hi: 'पहले से अकाउंट है?' },

    // Footer
    'footer.rights': { en: 'All rights reserved', hi: 'सर्वाधिकार सुरक्षित' },
    'footer.privacy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
    'footer.terms': { en: 'Terms of Service', hi: 'सेवा की शर्तें' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language') as Language;
        return saved || 'en';
    });

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        const translation = translations[key];
        if (!translation) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }
        return translation[language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

// Language Switcher Component
export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'en'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'hi'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
            >
                हिं
            </button>
        </div>
    );
};
