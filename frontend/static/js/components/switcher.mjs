export class Switcher {
    constructor(selector) {
        this.element = document.querySelector(selector);

        this.element.addEventListener('change', () => {
            this.toggled?.(this.element.checked);
        });
    }

    setChecked(checked) {
        this.element.checked = checked;
    }
}
