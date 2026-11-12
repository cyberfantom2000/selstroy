import { Modal } from "./modal.mjs";
import { ModalEvents } from "../core/events.mjs";


export class ImageViewModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('image-view-modal'));
        this.bus = bus;
        this.image = this.element.querySelector('img');

        this.bus.on(ModalEvents.ImageView.Open, (url) => {
            this.update(url);
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.ImageView.Rejected);
    }

    update(url) {
        this.image.src = url ?? '';
    }
}
