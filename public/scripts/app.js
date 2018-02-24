import { onServiceWorkerInit } from './messaging-service.js';

export const setupServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../../service-worker.js').then(
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
    return IndexedDb.readRecords(AppConfig.dbConfigs.userConfig.name, 'currentAuthor').then(
        author => author || 'John Doe'
    );
}
