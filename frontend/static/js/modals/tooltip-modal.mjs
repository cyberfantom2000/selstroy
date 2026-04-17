import { Modal } from "./modal.mjs";
import { ModalEvents } from "../core/events.mjs";


export class TooltipModal extends Modal{
    constructor({registry, bus}) {
        super(registry.get('tooltip-modal'));

        this.bus = bus;
        this.text = this.element.querySelector('[name="tooltip-text"]');

        this.bus.on(ModalEvents.Tooltip.Open, (payload) => {
            this.update(payload);
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.Tooltip.Rejected);
    }

    update(text) {
        this.text.textContent = text;
    }
}