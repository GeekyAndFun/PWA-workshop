import { setupUI, displayAuthor } from './scripts/ui.js';
import { setupServiceWorker } from './scripts/app.js';

const indexedDbStoreConfigs = [
    { name: 'AuthorStore' },
    { name: 'UnsentMsg', config: { keyPath: 'timestamp' } },
];

setupUI();
setupServiceWorker();
IndexedDb.setupDbStores('GeekyDatabase', 1, indexedDbStoreConfigs).then(() => {
    displayAuthor();
});

// toggleLoadingOfMessages();
// setupMessages();
// toggleLoadingOfMessages();
