let isOnline = true;

const updateOnlineStatus = () => {
    console.log('online toggle', navigator.onLine);
    isOnline = navigator.onLine;
};

window.addEventListener('load', () => {
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('online', updateOnlineStatus);
});

export const setupServiceWorkers = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../geeky-service-worker.js').then((registration) => {
            console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
        },
        (err) => {
            console.error(`Service Worker failed ${err}`);
        });

        // new Promise(((resolve, reject) => {
        //     Notification.requestPermission((result) => {
        //         if (result !== 'granted') return reject(Error('Denied notification permission'));
        //         resolve();
        //     });
        // })).then(() => navigator.serviceWorker.ready).then((reg) => {
        //     console.log(reg);
        //     reg.sync.register('syncTest');
        // });
    }
};

export const sendMessageRequest = () => {
    if (isOnline) {
        // to do request here
    } else {
        // cache here in serive worker
    }
};
