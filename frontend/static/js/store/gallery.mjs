import { GalleryEvents, ModelErrorType } from "../core/events.mjs";
import { normalizeFile, denormalize } from "./common.mjs";


function normalizeGalleryItem(data) {
    return {id: data.id, image: normalizeFile(data.image)};
}


function denormalizeGalleryItem(data) {
    const bindings = {id: 'id'};
    let result = denormalize(data, bindings);

    if (data.image)
        result.image_id = data.image.id;
    
    return result;
}


export class GalleryStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
        this.items = [];
        this.requestId = 0;
    }

    async load() {
        const requestId = ++this.requestId;
        try {
            const data = await this.api.requestAllItems();
            if (requestId !== this.requestId) return;

            this.items = data.map(normalizeGalleryItem);
            this.bus.emit(GalleryEvents.Update, this.items);
        } catch(err) {
            if (requestId !== this.requestId) return;
            this.bus.emit(GalleryEvents.Error, ModelErrorType.Load, err.toString());
            console.log(err);
        }
    }

    async createItem(data) {
        try {
            const reply = normalizeGalleryItem(await this.api.createItem(denormalizeGalleryItem(data)));
            this.items = [reply, ...this.items];
            this.bus.emit(GalleryEvents.Update, this.items);
        } catch(err) {
            this.bus.emit(GalleryEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async updateItem(data) {
        try {
            const reply = normalizeGalleryItem(await this.api.updateItem(denormalizeGalleryItem(data)));
            const index = this.items.findIndex(el => reply.id === el.id);
            this.items[index] = reply;
            this.bus.emit(GalleryEvents.Update, this.items);
        } catch(err) {
            this.bus.emit(GalleryEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }

    async removeItem(id) {
        try {
            await this.api.removeItem(id);
            this.items = this.items.filter(el => el.id !== id);
            this.bus.emit(GalleryEvents.Update, this.items);
        } catch (err) {
            this.bus.emit(GalleryEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }
}