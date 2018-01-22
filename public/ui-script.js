(function setupUI() {
    const defaultHeightInPixels = '50px';
    const maxHeight = 150;
    let header = document.getElementsByTagName('header')[0];
    let footer = document.getElementsByTagName('footer')[0];

    document.getElementById('headerIconContainer').addEventListener('click', function toggleMenu() {
        header.classList.toggle('header--with-menu');
        this.classList.toggle('flip');
        document.body.classList.toggle('menu--visible');
    });

    document.getElementsByTagName('textarea')[0].addEventListener('input', function onTextareaInput() {
        if (this.value === '') {
            footer.style.height = defaultHeightInPixels;
        } else {
            if (this.scrollHeight < maxHeight) {
                footer.style.height = `${this.scrollHeight}px`;
            }
        }
    });
})();
