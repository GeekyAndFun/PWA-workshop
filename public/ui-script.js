(function setupUIIife() {
    const DEFAULT_FOOTER_HEIGHT = '50px';
    const MAX_FOOTER_HEIGHT = 150;
    const ONBOARDING_DELAY = 3000;

    let header = document.getElementsByTagName('header')[0];
    let footer = document.getElementsByTagName('footer')[0];
    let ovelay = document.getElementById('overlay');

    document.getElementById('headerIconContainer').addEventListener('click', function toggleMenu() {
        document.body.classList.toggle('menu--visible');
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
    });

    document.getElementsByTagName('textarea')[0].addEventListener('input', function onTextareaInput() {
        if (this.value === '') {
            footer.style.height = DEFAULT_FOOTER_HEIGHT;
        } else {
            if (this.scrollHeight < MAX_FOOTER_HEIGHT) {
                footer.style.height = `${this.scrollHeight}px`;
            }
        }
    });

    if (!window.localStorage.getItem('onboarding')) {
        setTimeout(() => {
            overlay.style.display = 'block';
            window.localStorage.setItem('onboarding', 'true');
        }, ONBOARDING_DELAY);
    }
})();
