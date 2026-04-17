export class Modal {
    constructor(modal) {
        this.element = modal;
        this.escapeHandler = (event) => { if (event.key === 'Escape') this.reject(); };

        this.background = this.element.querySelector('[name="background"]');
        this.closeButton = this.element.querySelector('[name="close-button"]');
        
        if (this.background)
            this.background.onclick = () => this.reject();
        if (this.closeButton)
            this.closeButton.onclick = () => this.reject();

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

    data() {
        return null;
    }
}


export class ModalWithTwoButtons extends Modal{
    constructor(modal) {
        super(modal);

        this.submitButton = this.element.querySelector('[name="submit-button"]');
        this.rejectButton = this.element.querySelector('[name="reject-button"]');

        this.submitButton.onclick = () => this.submit();
        this.rejectButton.onclick = () => this.reject();
    }
}