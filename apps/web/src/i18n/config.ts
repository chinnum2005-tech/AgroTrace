import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import DOMPurify from 'dompurify';

import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import mr from './mr.json';
import bn from './bn.json';
import gu from './gu.json';
import ml from './ml.json';
import pa from './pa.json';
import or from './or.json';

i18n
  .use({
    type: 'postProcessor',
    name: 'sanitize',
    process: (value: string) => DOMPurify.sanitize(value)
  })
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      mr: { translation: mr },
      bn: { translation: bn },
      gu: { translation: gu },
      ml: { translation: ml },
      pa: { translation: pa },
      or: { translation: or },
    },
    lng: localStorage.getItem('farmconnect-lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping, but we add postProcess for safety
    },
    postProcess: ['sanitize'],
  });

export default i18n;
