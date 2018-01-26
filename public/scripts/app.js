import { setUpMessagingPushNotifications } from './messaging-service.js';

export const setupServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('https://geekyandfun.github.io/PWA-workshop/geeky-service-worker.js').then(
            registration => {
                setUpMessagingPushNotifications(registration);
            },
            err => {
                console.error(`Service Worker failed ${err}`);
            }
        );
    }
};

/** DATABASE */
export function setAuthor(name) {
    return IndexedDb.updateRecord('AuthorStore', name, 'currentAuthor');
}

export function getAuthor() {
    // TODO: write login service and get author from there. Index db should only hold the logged user in bettween sessions
    return IndexedDb.readRecords('AuthorStore', 'currentAuthor').then(author => author || 'John Doe');
}
