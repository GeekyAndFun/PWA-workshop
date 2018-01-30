const DEFAULT_FOOTER_HEIGHT = '50px';
const MAX_FOOTER_HEIGHT = 150;
const ONBOARDING_DELAY = 3000;

const footer = document.getElementsByTagName('footer')[0];
const textarea = document.getElementsByTagName('textarea')[0];
const offlineIcon = document.getElementById('offlineIcon');
let overlay = document.getElementById('overlay');

document.getElementById('headerIconContainer').addEventListener('click', () => {
    document.body.classList.toggle('menu--visible');
    if (overlay) {
        window.localStorage.setItem('onboarding', 'true');
        overlay.remove();
        overlay = null;
    }
});

textarea.addEventListener('input', function onTextareaInput() {
    if (this.value === '') {
        footer.style.height = DEFAULT_FOOTER_HEIGHT;
    } else if (this.scrollHeight < MAX_FOOTER_HEIGHT) {
        footer.style.height = `${this.scrollHeight}px`;
    }
});

if (!window.localStorage.getItem('onboarding')) {
    setTimeout(() => {
        overlay.style.display = 'block';
    }, ONBOARDING_DELAY);
}

window.isOnline = true;
window.addEventListener('offline', () => {
    window.isOnline = false;
    offlineIcon.style.display = 'block';
});

window.addEventListener('online', () => {
    window.isOnline = true;
    offlineIcon.style.display = 'none';
});
