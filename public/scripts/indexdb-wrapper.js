export function insertRecord(dbName, dbVersion, storeName, data) {
    return new Promise((resolve, reject) => {
        const clientDatabase = window.indexedDB.open(dbName, dbVersion);
        clientDatabase.onsuccess = function() {
            const db = clientDatabase.result;
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            store.put(data);

            tx.oncomplete = function() {
                db.close();
                resolve();
            };
            tx.onerror = function() {
                db.close();
                reject();
            };
        };
    });
}

export function getRecord() {
    if (!author.hasChanged) {
        return Promise.resolve(author.name);
    }

    const clientDatabase = window.indexedDB.open('GeekyDatabase', 1);

    return new Promise(resolve => {
        clientDatabase.onsuccess = function() {
            const db = this.result;
            const tx = db.transaction('AuthorStore', 'readwrite');
            const store = tx.objectStore('AuthorStore');
            // const index = store.index('AuthorIndex');

            const authorRetrieval = store.get('author');
            authorRetrieval.onsuccess = function() {
                db.close();
                if (authorRetrieval.result) {
                    resolve(authorRetrieval.result.name);
                } else {
                    resolve('John Doe');
                }
            };
        };
    });
}
