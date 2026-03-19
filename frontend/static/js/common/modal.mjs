export class Modal {
    constructor(modal) {
        this.element = modal;
        this.escapeHandler = (event) => { if (event.key === 'Escape') this.reject(); };

        this.submitClicked = null;
        this.rejectClicked = null;
    }

    submit() {
        if (!this.validate())
            return;

        if (this.submitClicked !== null)
            this.submitClicked(this.data());

        this.hide();
    }

    reject() {
        if (this.rejectClicked !== null)
            this.rejectClicked();

        this.hide();
    }

    show() {
        this.element.classList.remove('hidden');
        document.addEventListener('keydown', this.escapeHandler);
    }

    hide() {
        this.element.classList.add('hidden');
        document.removeEventListener('keydown', this.escapeHandler);
    }

    validate() {
        return true;
    }
}