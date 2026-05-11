import { ModalEvents } from "../core/events.mjs";
import { Modal } from "../modals/modal.mjs"


export class GalleryPreview extends Modal {
    constructor({registry, bus}) {
        super(registry.get('gallery-preview-modal'));
        this.bus = bus;
        this.url = null;

        this.nextButton = this.element.querySelector('[name="next-button"]');
        this.prevButton = this.element.querySelector('[name="prev-button"]');
        this.image = this.element.querySelector('img');

        this.bus.on(ModalEvents.ImageGallery.Open, (url) => {
            this.update(url)
            this.show();
        });

        this.nextButton.onclick = () => this.bus.emit(ModalEvents.ImageGallery.Next, this.url);
        this.nextButton.onclick = () => this.bus.emit(ModalEvents.ImageGallery.Previous, this.url);

        this.rejectClicked = () => this.update('');
    }

    update(url) {
        this.url = url;
        this.image.src = url;
    }
}