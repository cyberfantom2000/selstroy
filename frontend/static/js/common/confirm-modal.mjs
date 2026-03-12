export class ConfirmModal {
    constructor(modal) {
        this.element = modal;
        this.confirmBtn = this.element.querySelector('[name="confirm-button"]');
        this.title = this.element.querySelector('[name="title"]');
        this.description = this.element.querySelector('[name="description"]');

        this.onConfirm = null;
        this.onReject = null;
        
        const rejectBtn = this.element.querySelector('[name="reject-button"]');
        rejectBtn.onclick = () => { this.reject(); };

        const background = this.element.querySelector('[name="background"]');
        background.onclick = () => { this.reject(); };
        
        this.confirmBtn.onclick = () => { this.confirm(); };

        this.escapeHandler = () => {
            if (event.key === 'Escape')
              this.hide();
        };
    }

    reject() {
        if (this.onReject !== null)
            this.onReject();

        this.hide();
    }

    confirm() {
        if (this.onConfirm !== null)
            this.onConfirm();

        this.hide();
    }

    setText({title, description}) {
        this.title.textContent = title;
        this.description.textContent = description;
    }

    setSubmitButtonStyle(style) {
        const primaryColors = ['bg-primary-600', 'hover:bg-primary-700', 'dark:bg-primary-700', 'dark:hover:bg-primary-600'];
        const dangerColors = ['bg-red-600', 'hover:bg-red-700', 'dark:bg-red-700', 'dark:hover:bg-red-600'];
        this.confirmBtn.classList.remove(...primaryColors);
        this.confirmBtn.classList.remove(...dangerColors);

        if (style === 'primary')
            this.confirmBtn.classList.add(...primaryColors);
        else if (style === 'danger')
            this.confirmBtn.classList.add(...dangerColors);
        else
            throw new Error('Unknown button style');
    }

    show() {
        this.element.classList.remove('hidden');
        document.addEventListener('keydown', this.escapeHandler);
    }

    hide() {
        this.element.classList.add('hidden');
        document.removeEventListener('keydown', this.escapeHandler);
    }
}