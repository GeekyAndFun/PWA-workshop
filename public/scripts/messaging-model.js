import { getMessages, retrieveCachedMessages, onNewMessage } from './messaging-service.js';

let messages = [];
function mergeArrays(arr1, arr2) {
    let i = 0;
    let j = 0;
    const result = [];
    while (arr1[i] || arr2[j]) {
        if (!arr1[i]) {
            return result.concat(arr2.slice(j, arr2.length));
        }

        if (!arr2[j]) {
            return result.concat(arr1.slice(i, arr1.length));
        }

        if (arr1[i].timestamp < arr2[j].timestamp) {
            result.push(arr1[i]);
            i += 1;
        } else if (arr1[i].timestamp > arr2[j].timestamp) {
            result.push(arr2[j]);
            j += 1;
        } else {
            result.push(arr1[i]);
            if (arr1[i].text !== arr2[j].text) {
                result.push(arr2[j]);
            }
            i += 1;
            j += 1;
        }
    }
    return result;
}
function addNewMessages(msgs) {
    let messageArray;
    if (!Array.isArray(msgs)) {
        messageArray = [msgs];
    } else {
        messageArray = msgs;
    }
    messages = mergeArrays(messages, messageArray);
    return JSON.parse(JSON.stringify(messages));
}
export function getServerMsgs(onInit) {
    return getMessages().then(resp => {
        if (onInit) {
            onNewMessage(resp.latestTimestamp, addNewMessages);
        }
        messages = mergeArrays(messages, resp.messages);
        return JSON.parse(JSON.stringify(messages));
    });
}
export function getCachedMsgs() {
    return retrieveCachedMessages().then(resp => {
        messages = mergeArrays(messages, resp);
        return JSON.parse(JSON.stringify(messages));
    });
}
