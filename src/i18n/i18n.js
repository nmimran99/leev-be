import i18n from 'i18next';
import en from './locales/en/translation.json';
import he from './locales/he/translation.json';

const resources = {
    en: {
        translation: en
    },
    he: {
        translation: he
    }
}

i18n
    .init({
        resources,
        fallbackLng: 'he',
        detection: {
            order: ['queryString', 'cookie'],
            cache: ['cookie']
        },
        interpolation: {
            escapeValue: false
        }
    }, function(err, t) {
        if (err) {
            console.log('i18 not loaded correctly');
            return;
        }
        console.log('i18n loaded')
        
    });

export default i18n;
    