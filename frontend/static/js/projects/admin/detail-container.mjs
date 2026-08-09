import { AdminProjectDetail, DetaiItemButtons } from "./detail.mjs";


export class AdminProjectDetailsContainer {
    constructor({element, registry}) {
        this.registry = registry;
        this.container = element.querySelector('[name="items-container"]');
        this.addButton = element.querySelector('[name="add-button"]');
        this.items = new Map();
        this.removeDisabled = false;

        this.detailAddClicked = null;
        this.detailEditClicked = null;
        this.detailRemoveClicked = null;
        this.detailImageClicked = null;
        this.detailImageAddClicked = null;
        this.detailImageEditClicked = null;
        this.detailImageRemoveClicked = null;

        if (this.addButton)
            this.addButton.onclick = () => { if (this.detailAddClicked) this.detailAddClicked(); };
    }

    update(details) {
        const newIds = new Set(details.map(i => i.id));
        for (const id of this.items.keys()) {
            if (!newIds.has(id))
                this.remove(id);
        }

        for (const data of details) {
            if (!this.items.has(data.id)) {
                const detail = this.createItem(data);
                this.append(data.id, detail);
            }
            this.items.get(data.id).update(data);
            this.items.get(data.id).setButtonVisible(DetaiItemButtons.Remove, !this.removeDisabled);
        }
    }

    createItem() {
        const detail = new AdminProjectDetail(this.registry);
        detail.editClicked = () => { if (this.detailEditClicked) this.detailEditClicked(detail.data); };
        detail.removeClicked = () => { if (this.detailRemoveClicked) this.detailRemoveClicked(detail.data); };
        detail.imageClicked = (url) => { if (this.detailImageClicked) this.detailImageClicked(url); };
        detail.imageAddClicked = () => { if (this.detailImageAddClicked) this.detailImageAddClicked(detail.data); };
        detail.imageEditClicked = (imgData) => { if (this.detailImageEditClicked) this.detailImageEditClicked(detail.data, imgData); };
        detail.imageRemoveClicked = (imgData) => { if (this.detailImageRemoveClicked) this.detailImageRemoveClicked(detail.data, imgData); };
        return detail;
    }

    append(id, detail) {
        this.items.set(id, detail);
        this.container.appendChild(detail.element);
    }

    remove(id) {
        this.items.get(id).element.remove();
        this.items.delete(id);
    }

    setRemoveDisable(value) {
        this.removeDisabled = value;
        this.items.forEach((item) => item.setButtonVisible(DetaiItemButtons.Remove, !this.removeDisabled)); 
    }
}