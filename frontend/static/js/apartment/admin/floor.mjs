

export class AdminApartmentFloor {
    constructor(registry) {
        this.element = registry.getTemplate('apartment-floor-template');

        this.floor = this.element.querySelector('[name="floor"]');
        this.number = this.element.querySelector('[name="number"]');
        this.cost = this.element.querySelector('[name="cost"]');
        this.editButton = this.element.querySelector('[name="edit-button"]');
        this.removeButton = this.element.querySelector('[name="remove-button"]');

        this.editClicked = null;
        this.removeClicked = null;

        this.editButton.onclick = () => { if (this.editClicked) this.editClicked(this.data); };
        this.removeButton.onclick = () => { if (this.removeClicked) this.removeClicked(this.data.id); };
    }

    update(data) {
        this.data = data;
        this.floor.textContent = data.floor ?? 'unknown';
        this.number.textContent = data.number ?? 'unknown';
        this.cost.textContent = data.cost ?? 'unknown';
    }
}
