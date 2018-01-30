import { onServiceWorkerInit } from './messaging-service.js';

export const setupServiceWorker = () => {
    if ('serviceWorker' in navigator && false) {
        navigator.serviceWorker.register('../../geeky-service-worker.js').then(
            registration => {
                onServiceWorkerInit(true, registration);
            },
            err => {
                onServiceWorkerInit(false);
                console.error(err);
            }
        );
    } else {
        onServiceWorkerInit(false);
    }
};

/** DATABASE */
export function setAuthor(authorName) {
    return IndexedDb.updateRecord(AppConfig.dbConfigs.userConfig.name, authorName, 'currentAuthor');
}

export function getAuthor() {
    // TODO: write login service and get author from there. Index db should only hold the logged user in bettween sessions
    return IndexedDb.readRecords(AppConfig.dbConfigs.userConfig.name, 'currentAuthor').then(
        author => author || 'John Doe'
    );
}
