import { pretifyCost } from "../utils/utils.mjs"
import { apartmentTypeLabel } from "./type.mjs"

export class ApartmentItem {
    constructor(registry) {
        this.element = registry.getTemplate('apartment-item-template');

        this.image = this.element.querySelector('img');
        this.soldOutBadge = this.element.querySelector('[name="sold-out-badge"]');
        this.type = this.element.querySelector('[name="type"]');
        this.square = this.element.querySelector('[name="square"]');
        this.itemsDot = this.element.querySelector('[name="items-dot"]');
        this.itemsLeft = this.element.querySelector('[name="items-left"]');
        this.minCost = this.element.querySelector('[name="min-cost"]');
    }

    update(data) {
        const soldOut = data.floors.length === 0;

        this.element.href = data.url ?? '#';
        if (data.images.length > 0) {
            this.image.src = data.images[0].url;
            this.image.classList.remove('hidden');
        } else {
            this.image.removeAttribute('src');
            this.image.classList.add('hidden');
        }
        this.image.classList.toggle('grayscale', soldOut);
        this.soldOutBadge.classList.toggle('hidden', !soldOut);
        this.type.textContent = apartmentTypeLabel(data.type);
        this.square.textContent = data.square ? `${data.square}  м²` : '';

        const hasFloors = data.floors.length > 0;
        this.itemsLeft.textContent = hasFloors ? `Осталось: ${data.floors.length} кв.` : '';
        this.itemsLeft.classList.toggle('hidden', !hasFloors);
        this.itemsDot.classList.toggle('hidden', !hasFloors);

        if (hasFloors) {
            const minCost = Math.min(...data.floors.map(item => item.cost));
            this.minCost.textContent = `От ${pretifyCost(minCost)}`;
        } else {
            this.minCost.textContent = 'Распродано';
        }
    }
}