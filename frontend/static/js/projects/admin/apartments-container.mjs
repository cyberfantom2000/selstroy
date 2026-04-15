import { AdminApartmentItem } from "../../apartment/admin/item.mjs";


export class AdminApartmentsContainer {
    constructor({element, registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.container = element.querySelector('[name="items-container"]');
        this.addButton = element.querySelector('[name="create-button"]');
        this.items = new Map()

        this.createClicked = null;

        this.addButton.onclick = () => { if (this.createClicked) this.createClicked(); };
    }

    update(aparts) {
        const newIds = new Set(aparts.map(i => i.id));
        for (const id of this.items.keys()) {
            if (!newIds.has(id))
                this.remove(id);
        }

        for (const data of aparts) {
            if (!this.items.has(data.id)) {
                const floor = new AdminApartmentItem({registry: this.registry, bus: this.bus});
                this.append(data.id, floor);
            }
            this.items.get(data.id).update(data);
        }
    }

    append(id, item) {
        this.items.set(id, item);
        this.container.appendChild(item.element);
    }

    remove(id) {
        this.items.get(id).element.remove();
        this.items.delete(id);
    }
};