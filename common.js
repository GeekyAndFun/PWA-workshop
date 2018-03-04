/** IndexedDB Singleton */
const IndexedDb = (function() {
    let db;
    class IndexedDbClass {
        constructor() {
            db = null;
        }
        /**
         *
         * @param {Array<Object<{storeName: String, config: Object}>>} storeConfigs
         */
        setupDbStores(dbName, dbVersion, storeConfigs) {
            return new Promise((resolve, reject) => {
                const clientDatabase = indexedDB.open(dbName, dbVersion);
                clientDatabase.onupgradeneeded = function(e) {
                    storeConfigs.forEach(storeConfig => {
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

        setupDbConnection(dbName, dbVersion) {
            return new Promise((resolve, reject) => {
                if (db) {
                    return resolve();
                }
                const clientDatabase = indexedDB.open(dbName, dbVersion);
                clientDatabase.onsuccess = function onDatabaseSuccess(e) {
                    db = e.target.result;
                    resolve();
                };

                clientDatabase.onerror = reject;
            });
        }

        closeDbConnection() {
            if (!db) {
                return;
            }
            db.close();
            db = null;
        }

        pushRecord(storeName, data, key) {
            
        }

        shiftRecord(storeName) {
            return this.getStoreKeys(storeName).then(resp => this.deleteRecord(storeName, resp[0]));
        }

        updateRecord(storeName, data, key) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.put(data, key);

                request.onerror = reject;
                request.onsuccess = resolve;
            });
        }

        readRecords(storeName, key) {
        }

        deleteRecord(storeName, key) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.delete(key);

                request.onerror = reject;
                request.onsuccess = resolve;
            });
        }

        deleteAllRecords(storeName) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.clear();

                request.onerror = reject;
                request.onsuccess = resolve;
            });
        }

        getStoreKeys(storeName) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                const request = store.getAllKeys();

                request.onerror = reject;
                request.onsuccess = function(e) {
                    resolve(e.target.result);
                };
            });
        }
    }
    return new IndexedDbClass();
}());

/** Common Functions */
function getDateString(dateObject) {
    let hours = dateObject.getHours();
    if (hours < 10) {
        hours = `0${hours}`;
    }

    let minutes = dateObject.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
}

self.lazyDebounce = function(callback, delay) {
    let timeout = null;
    return function(e) {
        if (timeout) {
            window.clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            callback.call(this, e);
        }, delay);
    };
}