export class ChooseFileButton {
    constructor({button, input}) {
        this.button = button;
        this.input = input;

        this.chooseChanged = null;

        button.addEventListener('click', () => this.input.click());
        input.addEventListener('change', () => { if (this.chooseChanged !== null) this.chooseChanged(this.input.files); });
    }
};