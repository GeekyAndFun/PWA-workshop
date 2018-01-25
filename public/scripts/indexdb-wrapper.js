let db = null;

/**
 *
 * @param {Array<Object<{storeName: String, config: Object}>>} storeConfigs
 */
export function setupDbStores(dbVersion, storeConfigs) {
    const clientDatabase = window.indexedDB.open('GeekyDatabase', dbVersion);

    return new Promise((resolve, reject) => {
        clientDatabase.onupgradeneeded = function(e) {
            storeConfigs.forEach((storeConfig) => {
                if (!e.target.result.objectStoreNames.contains(storeConfig.name)) {
                    e.target.result.createObjectStore(storeConfig.name, storeConfig.config);
                }
            });
        };

        clientDatabase.onsuccess = function onDatabaseSuccess(e) {
            db = e.target.result;
            resolve();
        };

        clientDatabase.onerror = reject;
    });
}

export function insertRecord(storeName, data, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const authStore = transaction.objectStore(storeName);

        const request = authStore.add(data, key);

        request.onerror = function() {
            reject();
        };

        request.onsuccess = function() {
            resolve();
        };
    });
}

export function updateRecord(storeName, data, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const authStore = transaction.objectStore(storeName);

        const request = authStore.put(data, key);

        request.onerror = function() {
            reject();
        };

        request.onsuccess = function() {
            resolve();
        };
    });
}

export function readRecord(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const authStore = transaction.objectStore(storeName);

        const request = authStore.get(key);

        request.onerror = function() {
            reject();
        };

        request.onsuccess = function(e) {
            resolve(e.target.result);
        };
    });
}

export function deleteRecord(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const authStore = transaction.objectStore(storeName);

        const request = authStore.delete(key);

        request.onerror = function() {
            reject();
        };

        request.onsuccess = function() {
            resolve();
        };
    });
}
