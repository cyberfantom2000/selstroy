import { ModalEvents, GalleryEvents } from "../../core/events.mjs";
import { GalleryItem } from "../../gallery/item.mjs"
import { Modal } from "../../modals/modal.mjs";


export class GalleryContainer {
    constructor({registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.element = this.registry.get('gallery-container');

        this.bus.on(GalleryEvents.Update, (items) => this.updateGallery(items));

        this.bus.on(ModalEvents.ImageGallery.Next, (prevUrl) => {
            const items = [...this.items.values()];
            const index = items.findIndex(el => el.url === prevUrl);
            
            if (index === -1)
                return;

            const nextIndex = (index + 1) % items.length;
            this.bus.emit(ModalEvents.ImageGallery.Open, items[nextIndex].url);
        });

        this.bus.on(ModalEvents.ImageGallery.Previous, (prevUrl) => {
            const items = [...this.items.values()];
            const index = items.findIndex(el => el.url === prevUrl);

            if (index === -1)
                return;

            const prevIndex = (index - 1 + items.length) % items.length;
            this.bus.emit(ModalEvents.ImageGallery.Open, items[prevIndex].url);
        });
    }

    updateGallery(galleryItems) {
        const newIds = new Set(galleryItems.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of galleryItems) {
            if (!this.items.has(data.id)) {
                const item = new GalleryItem(this.registry);
                item.clicked = (url) => this.bus.emit(ModalEvents.ImageGallery.Open, url);
                this.items.set(data.id, item);
                this.element.prepend(item.element)
            }

            this.items.get(data.id).update(data);
        }
    }
}