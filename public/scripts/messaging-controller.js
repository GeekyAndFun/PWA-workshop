import { getServerMsgs, getCachedMsgs } from './messaging-model.js';
import { updateUI, setupUI } from './ui.js';

export function dispatchGetCachedMsgs() {
    getCachedMsgs().then(resp => {
        updateUI(resp);
    });
}

export function dispatchGetServerMsgs(onInit) {
    // debugger;
    getServerMsgs(onInit, resp => {
        updateUI(resp, onInit);
    });

    // .then((resp) => {
    // updateUI(resp);
    // })
}

setupUI(dispatchGetServerMsgs);
