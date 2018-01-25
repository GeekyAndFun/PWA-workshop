import SetupUI from './scripts/ui.js';
import { setupClientDatabase, setupServiceWorkers } from './scripts/app.js';

SetupUI();
setupServiceWorkers();
setupClientDatabase();

// toggleLoadingOfMessages();
// setupMessages();
// toggleLoadingOfMessages();
