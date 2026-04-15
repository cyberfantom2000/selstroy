
export class PromoItem {
    constructor({data, registry}) {
        this.element = registry.getTemplate('promo-item-base-template');

        this.image = this.element.querySelector('img');
        this.description = this.element.querySelector('[name="description"]');

        this.update(data);
    }

    update(data) {
        this.image.src = data.imageUrl;
        this.description.innerHTML = data.text;
    }
}