import { ModalEvents, GalleryEvents } from "../../core/events.mjs";
import { GalleryItem } from "../../gallery/item.mjs"
import { Modal } from "../../modals/modal.mjs";


export class GalleryContainer {
    constructor({registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.items = [];

        this.element = this.registry.get('gallery-container');

        this.bus.on(GalleryEvents.Update, (items) => this.updateGallery(items));

        this.bus.on(ModalEvents.ImageGallery.Next, (payload) => {
            const index = this.items.findIndex(el => el.id === payload.id);
            
            if (index === -1)
                return;

            const nextIndex = (index + 1) % this.items.length;
            const item = this.items[nextIndex];
            this.bus.emit(ModalEvents.ImageGallery.Open, item.url, {id: item.id});
        });

        this.bus.on(ModalEvents.ImageGallery.Previous, (payload) => {
            const index = this.items.findIndex(el => el.id === payload.id);

            if (index === -1)
                return;

            const prevIndex = (index - 1 + this.items.length) % this.items.length;
            const item = this.items[prevIndex];
            this.bus.emit(ModalEvents.ImageGallery.Open, item.url, {id: item.id});
        });
    }

    updateGallery(galleryItems) {
        for (const item of this.items)
            item.element.remove();

        this.items = [];

        for (const data of galleryItems) {
            const item = new GalleryItem(this.registry);
            item.clicked = (url) => this.bus.emit(ModalEvents.ImageGallery.Open, url, {id: data.id});
            this.element.prepend(item.element)
            this.items = [item, ...this.items];
            item.update(data);
        }
    }
}