/** IndexedDB Singleton */
const IndexedDb = (function () {
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
                clientDatabase.onupgradeneeded = function (e) {
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
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.add(data, key);

                request.onerror = reject;
                request.onsuccess = resolve;
            });
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
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                const request = key !== undefined && key !== null ? store.get(key) : store.getAll();

                request.onerror = reject;

                request.onsuccess = function (e) {
                    resolve(e.target.result);
                };
            });
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
                request.onsuccess = function (e) {
                    resolve(e.target.result);
                };
            });
        }
    }
    return new IndexedDbClass();
}());

/** Common Functions */
self.getDateString = function (dateObject) {
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

async function sendCachedMessages(databaseRef) {
    if (window.firebase) {
        databaseRef = databaseRef || window.firebase.database().ref('/messages');
    };

    await IndexedDb.setupDbConnection(AppConfig.dbName, AppConfig.dbVersion);
    const cachedMessages = await IndexedDb.readRecords(AppConfig.dbConfigs.messagesConfig.name);
    const unsentMessages = cachedMessages.filter(record => record.unsent);

    return Promise.all(
        unsentMessages.map(msg =>
            databaseRef.push(Object.assign({}, msg, {
                unsent: false
            })).then(() => {
                IndexedDb.updateRecord(
                    AppConfig.dbConfigs.messagesConfig.name,
                    Object.assign({}, msg, {
                        unsent: false
                    })
                );
            })
        )
    );
}

self.lazyDebounce = function (callback, delay) {
    let timeout = null;
    return function (e) {
        if (timeout) {
            window.clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            callback.call(this, e);
        }, delay);
    };
}