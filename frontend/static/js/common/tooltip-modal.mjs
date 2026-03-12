
export class TooltipModal {
    constructor(modal) {
        this.element = modal;
        this.text = this.element.querySelector('[name="tooltip-text"]');

        this.element.querySelector('[name="background"]').onclick = () => this.hide();
        this.element.querySelector('[name="close-button"]').onclick = () => this.hide();
    }

    setText(text) {
        this.text.textContent = text;
    }

    show(text=null) {
        if (text !== null)
            this.setText(text);
        
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}