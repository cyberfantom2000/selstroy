import { mediaUrl } from "../api/base-urls.mjs";
import { PromoEvents, ModelErrorType } from "../core/events.mjs";


function normalize(data) {
    return {
        id: data.id,
        text: data.text,
        isDraft: data.is_draft,
        imageUrl: data.image ? `${mediaUrl}/${data.image.id}` : '',
        imageId: data.image ? data.image.id : ''
    };
}


function denormalize(data) {
    let result = {};
    const mapping = {id: 'id', text: 'text', isDraft: 'is_draft', imageId: 'image_id'};
    for (const [from, to] of Object.entries(mapping)) {
        if (from in data)
            result[to] = data[from];
    }
    return result;
}


export class PromoStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
        this.promos = [];
        this.requestId = 0;
    }

    async load() {
        const requestId = ++this.requestId;
        try {
            const data = await this.api.requestAll();
            if (requestId !== this.requestId) return;

            this.promos = data.map(normalize);
            this.bus.emit(PromoEvents.Update, this.promos);
        } catch(err) {
            if (requestId !== this.requestId) return;
            this.bus.emit(PromoEvents.Error, ModelErrorType.Load, err.toString());
            console.log(err);
        }
    }

    async create(data) {
        try {
            const reply = normalize(await this.api.create(denormalize(data)));
            this.promos = [reply, ...this.promos];
            this.bus.emit(PromoEvents.Update, this.promos);
        } catch(err) {
            this.bus.emit(PromoEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async update(data) {
        try {
            const reply = normalize(await this.api.update(denormalize(data)));
            const index = this.promos.findIndex(el => reply.id === el.id);
            this.promos[index] = reply;
            this.bus.emit(PromoEvents.Update, this.promos);
        } catch(err) {
            this.bus.emit(PromoEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }

    async remove(id) {
        try {
            await this.api.remove(id);
            this.promos = this.promos.filter(el => el.id !== id);
            this.bus.emit(PromoEvents.Update, this.promos);
        } catch (err) {
            this.bus.emit(PromoEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }
}