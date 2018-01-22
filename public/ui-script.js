(function setupUI() {
    const defaultHeightInPixels = '50px';
    const maxHeight = 150;
    let footer = document.getElementsByTagName('footer')[0];

    document.getElementById('headerIconContainer').addEventListener('click', function toggleMenu() {
        this.classList.toggle('flip');
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
