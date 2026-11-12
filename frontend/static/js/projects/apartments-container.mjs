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
            let item = this.items.get(data.id);

            if (!item) {
                item = new ApartmentItem(this.registry);
                this.items.set(data.id, item);
            }

            item.update(data);
            this.container.appendChild(item.element);
        }
    }
}