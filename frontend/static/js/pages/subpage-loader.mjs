import { SubpageEvents } from "../core/events.mjs";


export class SubpageLoader {
    constructor(bus) {
        this.loaders = new Map();
        bus.on(SubpageEvents.Request.Load, (pageId) => this.loadPage(pageId));
    }

    bind(page, loader) {
        this.loaders.set(page.id, loader);
    } 

    async loadPage(pageId) {
        if (this.loaders.has(pageId)) {
            await this.loaders.get(pageId)();
            this.loaders.delete(pageId);
        }
    }
};