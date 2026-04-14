
import { AdminApartmentFloor } from "./apartment-floor.mjs";


export class ApartmentFloorsContainer {
    constructor({element, registry}) {
        this.registry = registry;
        this.container = element.querySelector('[name="items-container"]');
        this.addButton = element.querySelector('[name="add-button"]');
        this.items = new Map()

        this.addClicked = null;
        this.itemEditClicked = null;
        this.itemRemoveClicked = null;

        this.addButton.onclick = () => { if (this.addClicked) this.addClicked(); };
    }

    update(floors) {
        const newIds = new Set(floors.map(i => i.id));
        for (const id of this.items.keys()) {
            if (!newIds.has(id))
                this.remove(id);
        }

        for (const data of floors) {
            if (!this.items.has(data.id)) {
                const floor = this.createItem(data);
                this.append(data.id, floor);
            }
            this.items.get(data.id).update(data);
        }
    }

    createItem(data) {
        const floor = new AdminApartmentFloor(this.registry);
        floor.editClicked = () => { if (this.itemEditClicked) this.itemEditClicked(floor.data); };
        floor.removeClicked = () => { if (this.itemRemoveClicked) this.itemRemoveClicked(floor.data); };
        return floor;
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