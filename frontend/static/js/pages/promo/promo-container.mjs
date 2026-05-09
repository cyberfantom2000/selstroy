import { PromoEvents } from "../../core/events.mjs";
import { PromoItem } from "../../promo/item.mjs";


export class PromoContainer {
    constructor({registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.element = this.registry.get('promo-container');

        this.bus.on(PromoEvents.Update, (promotions) => this.updatePromotions(promotions));
    }

    updatePromotions(promotions) {
        const newIds = new Set(promotions.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of promotions) {
            if (!this.items.has(data.id)) {
                const item = new PromoItem(this.registry);
                this.items.set(data.id, item);
                this.element.appendChild(item.element)
            }

            this.items.get(data.id).update(data);
        }
    }
}