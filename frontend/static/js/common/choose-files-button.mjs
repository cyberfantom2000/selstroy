export class ChooseFileButton {
    constructor({button, input}) {
        this.button = button;
        this.input = input;

        this.filesChoosed = null;

        button.addEventListener('click', () => this.input.click());
        input.addEventListener('change', () => { if (this.filesChoosed !== null) this.filesChoosed(this.input.files); });
    }
};