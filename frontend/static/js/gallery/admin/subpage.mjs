import { Page } from "../../pages/page.mjs";
import { GalleryEvents } from "../../core/events.mjs";
import { EditableImage } from "../../components/editable-image.mjs";


export class AdminGallerySubpage extends Page {
    constructor({registry, bus}) {
        super({pageContainer: registry.get('gallery-subpage'), itemsContainer: registry.get('gallery-subpage-container')});
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.createButton = registry.get('create-gallery-item-button');
        this.createButton.onclick = () => this.bus.emit(GalleryEvents.Request.Create);

        this.bus.on(GalleryEvents.Update, (items) => this.galleryItemsChanged(items));
        this.bus.on(GalleryEvents.Clear, () => this.clear());
    }

    galleryItemsChanged(galleryItems) {
        const newIds = new Set(galleryItems.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of galleryItems) {
            if (!this.items.has(data.id)) {
                const item = new EditableImage(this.registry.getTemplate('gallery-item-template'));
                item.clicked = (url) => this.bus.emit(GalleryEvents.Request.Open, url);
                item.editClicked = () => this.bus.emit(GalleryEvents.Request.Edit, data);
                item.removeClicked = () => this.bus.emit(GalleryEvents.Request.Remove, data);
                this.items.set(data.id, item);
                this.pushItemToFront(item.element)
            }

            this.items.get(data.id).update(data.image);
        }
    }
};