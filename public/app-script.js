export const setupServiceWorgers = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../geeky-service-worker.js').then((registration) => {
            console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
        },
        (err) => {
            console.error(`Service Worker failed ${err}`);
        });
    }
};
