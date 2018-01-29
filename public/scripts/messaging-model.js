import { getMessages, retrieveCachedMessages } from './messaging-service.js';

let messages = [];
function mergeArrays(arr1, arr2) {
    let i = 0;
    let j = 0;
    const result = [];
    while (arr1[i] || arr2[j]) {
        if (!arr1[i]) {
            result.concat(arr2.slice(j, arr2.length));
            return result;
        }

        if (!arr2[j]) {
            result.concat(arr1.slice(i, arr1.length));
            return result;
        }

        if (arr1[i].timestamp < arr1[j].timestamp) {
            result.push(arr1[i]);
            i += 1;
        } else if (arr1[i].timestamp > arr1[j].timestamp) {
            result.push(arr1[j]);
            j += 1;
        } else {
            i += 1;
            j += 1;
            result.push(arr1[j]);
        }
    }
    return result;
}
export function getServerMsgs() {
    return getMessages().then(resp => {
        messages = mergeArrays(messages, resp);
        return messages;
    });
}
export function getCachedMsgs() {
    return retrieveCachedMessages().then(resp => {
        messages = mergeArrays(messages, resp);
        return messages;
    });
}
export function ceva() { return null; }
