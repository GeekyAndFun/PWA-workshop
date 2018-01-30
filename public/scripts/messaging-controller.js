import { getServerMsgs, getCachedMsgs } from './messaging-model.js';
import { updateUI, setupUI } from './ui.js';

export function dispatchGetCachedMsgs() {
    getCachedMsgs().then((resp) => {
        updateUI(resp);
    });
}

export function dispatchGetServerMsgs(onInit) {
    getServerMsgs(onInit).then((resp) => {
        updateUI(resp);
    });
}

setupUI(dispatchGetServerMsgs);
