import { SiteSettingsEvents, ModelErrorType } from "../core/events.mjs";
import { normalizeFile, denormalize } from "./common.mjs";


function normalizeSettings(data) {
    return {
        id: data.id,
        yearsOnMarket: data.years_on_market,
        commissionedArea: data.commissioned_area,
        housesBuilt: data.houses_built,
        residentsCount: data.residents_count,
        heroImage: data.hero_image ? normalizeFile(data.hero_image) : null,
    };
}


function denormalizeSettings(data) {
    const bindings = {
        yearsOnMarket: 'years_on_market',
        commissionedArea: 'commissioned_area',
        housesBuilt: 'houses_built',
        residentsCount: 'residents_count',
    };
    const result = denormalize(data, bindings);

    if (data.heroImage !== undefined)
        result.hero_image_id = data.heroImage ? data.heroImage.id : null;

    return result;
}


export class SiteSettingsStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
        this.settings = null;
        this.requestId = 0;
        this.updateRequestId = 0;
    }

    current() {
        return this.settings;
    }

    async load() {
        const requestId = ++this.requestId;
        try {
            const data = await this.api.current();
            if (requestId !== this.requestId) return null;

            this.settings = normalizeSettings(data);
            this.bus.emit(SiteSettingsEvents.Update, this.settings);
            return this.settings;
        } catch (err) {
            if (requestId !== this.requestId) return null;

            this.bus.emit(SiteSettingsEvents.Error, ModelErrorType.Load, err.toString());
            console.log(err);
            return null;
        }
    }

    async update(data) {
        const requestId = ++this.updateRequestId;
        ++this.requestId;

        try {
            const reply = await this.api.update(denormalizeSettings(data));
            if (requestId !== this.updateRequestId) return null;

            ++this.requestId;
            this.settings = normalizeSettings(reply);
            this.bus.emit(SiteSettingsEvents.Update, this.settings);
            return this.settings;
        } catch (err) {
            if (requestId !== this.updateRequestId) return null;

            this.bus.emit(SiteSettingsEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
            return null;
        }
    }
}
