import { ModalEvents } from "../core/events.mjs";
import { ModalWithTwoButtons } from "./modal.mjs";


export class ConfirmModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('confirm-modal'));
        
        this.bus = bus;
        this.description = this.element.querySelector('[name="description"]');

        this.bus.on(ModalEvents.Confirm.Open, (payload) => {
            this.payload = payload;
            if (payload.style)
                this.setSubmitButtonStyle(payload.style);
            this.update(payload.text ?? '');
            this.show();
        });

        this.submitClicked = () => {
            if (this.payload)
                this.bus.emit(ModalEvents.Confirm.Confirmed, this.payload);
            this.payload = null;
        };

        this.rejectClicked = () => {
            if (this.payload)
                this.bus.emit(ModalEvents.Confirm.Rejected, this.payload);
            this.payload = null;
        };
    }

    update(text) {
        this.description.textContent = text;
    }

    setSubmitButtonStyle(style) {
        const primaryColors = ['bg-primary-600', 'hover:bg-primary-700', 'dark:bg-primary-700', 'dark:hover:bg-primary-600'];
        const dangerColors = ['bg-red-600', 'hover:bg-red-700', 'dark:bg-red-700', 'dark:hover:bg-red-600'];
        this.submitButton.classList.remove(...primaryColors);
        this.submitButton.classList.remove(...dangerColors);

        if (style === 'primary')
            this.submitButton.classList.add(...primaryColors);
        else if (style === 'danger')
            this.submitButton.classList.add(...dangerColors);
        else
            throw new Error('Unknown button style');
    }
}