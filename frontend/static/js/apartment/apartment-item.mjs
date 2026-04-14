import { mediaUrl } from "../api/base-urls.mjs";


export class ApartmentItem {
    constructor({data, template}) {
        this.fragment = template.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;

        this.ref = this.fragment.querySelector('a');
        this.image = this.fragment.querySelector('img');
        this.type = this.fragment.querySelector('[name="type"]');
        this.square = this.fragment.querySelector('[name="square"]');
        this.itemsLeft = this.fragment.querySelector('[name="items-left"]');
        this.minCost = this.fragment.querySelector('[name="min-cost"]');

        this.update(data);
    }

    update(data) {
        this.ref.href = data.href ?? '';
        this.image.src = data.image_id ? `${mediaUrl}/${data.image_id}` : '';
        this.type.textContent = data.type ?? 'unknown';
        this.square.textContent = data.square ? `${data.square}  м²` : 'unknown';
        this.itemsLeft.textContent = data.items_left ? `Осталось: ${data.items_left}` : 'unknown';
        this.minCost.textContent = data.min_cost ? `От ${data.min_cost} ₽` : 'unknown';
    }
}