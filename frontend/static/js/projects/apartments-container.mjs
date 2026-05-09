import { ApartmentItem } from "../apartment/item.mjs";


export class ApartmentsContainer {
    constructor({container, registry}) {
        this.container = container;
        this.registry = registry;
        this.items = new Map();
    }

    update(apartments) {
        const newIds = new Set(apartments.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of apartments) {
            if (!this.items.has(data.id)) {
                const item = new ApartmentItem(this.registry);
                this.items.set(data.id, item);
                this.container.appendChild(item.element)
            }

            this.items.get(data.id).update(data);
        }
    }
}