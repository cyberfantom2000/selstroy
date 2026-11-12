import { pretifyCost } from "../utils/utils.mjs"
import { apartmentTypeLabel } from "./type.mjs"

export class ApartmentItem {
    constructor(registry) {
        this.element = registry.getTemplate('apartment-item-template');

        this.image = this.element.querySelector('img');
        this.soldOutBadge = this.element.querySelector('[name="sold-out-badge"]');
        this.type = this.element.querySelector('[name="type"]');
        this.square = this.element.querySelector('[name="square"]');
        this.itemsLeft = this.element.querySelector('[name="items-left"]');
        this.minCost = this.element.querySelector('[name="min-cost"]');
    }

    update(data) {
        const soldOut = data.floors.length === 0;

        this.element.href = data.url ?? '#';
        this.image.src = data.images.length > 0 ? data.images[0].url : '';
        this.image.classList.toggle('grayscale', soldOut);
        this.soldOutBadge.classList.toggle('hidden', !soldOut);
        this.type.textContent = apartmentTypeLabel(data.type);
        this.square.textContent = data.square ? `${data.square}  м²` : '';
        this.itemsLeft.textContent = data.floors ? `Осталось: ${data.floors.length} кв.` : '';

        if (data.floors.length > 0) {
            const minCost = Math.min(...data.floors.map(item => item.cost));
            this.minCost.textContent = `От ${pretifyCost(minCost)}`;
        } else {
            this.minCost.textContent = 'Распродано';
        }
    }
}