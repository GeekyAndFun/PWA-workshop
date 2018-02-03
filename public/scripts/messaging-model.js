import { getMessages, retrieveCachedMessages, onNewMessage } from './messaging-service.js';

let messages = [];
function mergeArrays(arr1, arr2) {
    const result = [];

    let i = 0;
    let j = 0;
    while (arr1[i] || arr2[j]) {
        if (!arr1[i]) {
            return [...result, ...arr2.slice(j)];
        }

        if (!arr2[j]) {
            return [...result, ...arr1.slice(i)];
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

export function getServerMsgs(onInit, callbackF) {
    getMessages().then(resp => {
        if (onInit) {
            onNewMessage(resp.latestTimestamp, msgResp => {
                addNewMessages(msgResp);
                callbackF(JSON.parse(JSON.stringify(messages)));
            });
        }

        messages = mergeArrays(messages, resp.messages);
        callbackF(JSON.parse(JSON.stringify(resp.messages)));
    });
}

export function getCachedMsgs() {
    return retrieveCachedMessages().then(resp => {
        messages = mergeArrays(messages, resp);
        return JSON.parse(JSON.stringify(messages));
    });
}
