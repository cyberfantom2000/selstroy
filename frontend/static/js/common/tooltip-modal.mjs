import { Modal } from "./modal.mjs";


export class TooltipModal extends Modal{
    constructor(modal) {
        super(modal);

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
        
        super.show();
    }
}