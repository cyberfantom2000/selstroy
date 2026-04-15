import { Page } from "../../pages/page.mjs";
import { AdminPromoItem } from "./item.mjs"
import { PromoEvents } from "../../core/events.mjs";


export class AdminPromoSubpage extends Page {
    constructor({registry, bus}) {
        super({pageContainer: registry.get('promo-subpage'), itemsContainer: registry.get('promo-subpage-container')});

        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.createButton = this.registry.get('create-promo-button');
        this.createButton.onclick = () => this.bus.emit(PromoEvents.Request.Create);

        this.bus.on(PromoEvents.Update, (promos) => this.promosChanged(promos));
        this.bus.on(PromoEvents.Clear, () => this.clear());
    }

    promosChanged(promos) {
        const newIds = new Set(promos.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of promos) {
            if (!this.items.has(data.id)) {
                const item = new AdminPromoItem({data: data, registry: this.registry, bus: this.bus});
                this.items.set(data.id, item);
                this.pushItemToFront(item.element);
            }
            this.items.get(data.id).update(data);
        }
    }
}
