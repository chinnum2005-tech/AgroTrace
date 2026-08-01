import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
  { code: 'bn', label: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', flag: '🇮🇳', nativeName: 'ଓଡ଼ିଆ' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('farmconnect-lang', code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        id="language-selector"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-sm"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300 hidden sm:inline whitespace-nowrap">{current.flag} {current.nativeName}</span>
        <span className="text-gray-700 dark:text-gray-300 sm:hidden whitespace-nowrap">{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    lang.code === i18n.language
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">({lang.label})</span>
                  </div>
                  {lang.code === i18n.language && <Check className="h-4 w-4 text-green-600" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
