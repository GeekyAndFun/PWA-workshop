const swPrecache = require('sw-precache');

const options = {
    staticFileGlobs: [
        '/',
        'index.html',
        'public/images/icon.png',
        'public/images/icon--flipped.png',
        'public/style.css',
        'public/scripts/pre-data-ui.js'
    ],
    skipWaiting: true
};

swPrecache.write('./caching-service-worker.js', options, err => {
    if (err) {
        console.error(err);
    }
});

