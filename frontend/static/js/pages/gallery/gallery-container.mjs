import { ModalEvents, GalleryEvents } from "../../core/events.mjs";
import { GalleryItem } from "../../gallery/item.mjs";


const Direction = {
    Next: 1,
    Previous: -1,
};


export class GalleryContainer {
    constructor({registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.items = [];

        this.element = this.registry.get('gallery');
        this.itemsContainer = this.element.querySelector('[name="items"]');
        this.empty = this.element.querySelector('[name="empty"]');

        this.bus.on(GalleryEvents.Update, (items) => this.updateGallery(items));
        this.bus.on(GalleryEvents.Error, () => {
            this.element.setAttribute('aria-busy', 'false');
        });

        this.bus.on(ModalEvents.ImageGallery.Next, ({id}) => this.switchImage(Direction.Next, id));
        this.bus.on(ModalEvents.ImageGallery.Previous, ({id}) => this.switchImage(Direction.Previous, id));
    }

    sendOpenRequest(item) {
        this.bus.emit(ModalEvents.ImageGallery.Open, item.url, {
            id: item.id,
            index: this.items.indexOf(item),
            total: this.items.length,
            navigable: this.items.length > 1,
        });
    }

    switchImage(direction, id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1 || this.items.length < 2) return;

        const nextIndex = (index + direction + this.items.length) % this.items.length;
        this.sendOpenRequest(this.items[nextIndex]);
    }

    updateGallery(galleryItems) {
        for (const item of this.items)
            item.element.remove();

        this.items = [];

        for (const data of galleryItems) {
            const item = new GalleryItem(this.registry);
            item.clicked = () => this.sendOpenRequest(item);
            this.itemsContainer.prepend(item.element);
            this.items.unshift(item);
            item.update(data);
        }

        this.empty.classList.toggle('hidden', this.items.length > 0);
        this.element.setAttribute('aria-busy', 'false');
    }
}
