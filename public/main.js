import { setupUI, displayAuthor } from './scripts/ui.js';
import { setupServiceWorkers } from './scripts/app.js';
import { setupDbStores } from './scripts/indexdb-wrapper.js';

setupUI();
setupServiceWorkers();
setupDbStores(1, [{ name: 'AuthorStore' }, { name: 'UnsentMsg' }]).then(() => {
    displayAuthor();
});

// toggleLoadingOfMessages();
// setupMessages();
// toggleLoadingOfMessages();
