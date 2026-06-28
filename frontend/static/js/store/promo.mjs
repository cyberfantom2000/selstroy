import { ApiUrls } from "../api/base-urls.mjs";
import { PromoEvents, ModelErrorType } from "../core/events.mjs";
import { denormalize } from "./common.mjs";


function normalizePromo(data) {
    return {
        id: data.id,
        text: data.text,
        isDraft: data.is_draft,
        imageUrl: data.image ? `${ApiUrls.media}/${data.image.id}` : '',
        imageId: data.image ? data.image.id : ''
    };
}


function denormalizePromo(data) {
    const bindings = {id: 'id', text: 'text', isDraft: 'is_draft', imageId: 'image_id'};
    return denormalize(data, bindings);
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

            this.promos = data.map(normalizePromo);
            this.bus.emit(PromoEvents.Update, this.promos);
        } catch(err) {
            if (requestId !== this.requestId) return;
            this.bus.emit(PromoEvents.Error, ModelErrorType.Load, err.toString());
            console.log(err);
        }
    }

    async create(data) {
        try {
            const reply = normalizePromo(await this.api.create(denormalizePromo(data)));
            this.promos = [reply, ...this.promos];
            this.bus.emit(PromoEvents.Update, this.promos);
        } catch(err) {
            this.bus.emit(PromoEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async update(data) {
        try {
            const reply = normalizePromo(await this.api.update(denormalizePromo(data)));
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