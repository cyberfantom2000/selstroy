import { mediaUrl } from "../api/base-urls.mjs";


class Apartment {
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


class SoldOut {
    constructor({data, template}) {
        this.fragment = template.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;

        this.ref = this.fragment.querySelector('a');
        this.image = this.fragment.querySelector('img');

        this.update(data);
    }

    update(data) {
        this.ref.href = data.href ?? '';
        this.image.src = data.image_id ? `${mediaUrl}/${data.image_id}` : '';
    }
}


export class ApartmentsContainer {
    constructor({container, apartTemplate, soldOutTemplate}) {
        this.container = container;
        this.apartTemplate = apartTemplate;
        this.soldOutTemplate = soldOutTemplate;
    }

    add(appartments) {
        for (const apartData of appartments) {
            const item = this.buildItem(apartData);
            this.container.appendChild(item.fragment);
        }
    }

    buildItem(data) {
        if (data.items.length !== 0)
            return this.buildApart(data);
        else
            return this.buildSoldOut(data);
    }

    buildApart(data) {
        return new Apartment({ 
            data: {
                href: '', // TODO
                image_id: data.preview_image ? data.preview_image.id : null,
                type: data.type,
                square: data.square,
                items_left: apartData.items.length,
                min_cost: data.items.reduce((min, next) =>  next.cost < min.cost ? next : min )
            }, 
            template: this.apartTemplate 
        });
    }

    buildSoldOut(data) {
        return new SoldOut({
            data : {
                href: '', // TODO
                image_id: data.preview_image ? data.preview_image.id : null
            },
            template: this.soldOutTemplate
        });
    }

    clear() {
        while (this.container.firstChild)
            this.container.removeChild(this.container.firstChild);
    }

    setVisible(visible) {
        if (visible)
            this.container.classList.remove('hidden');
        else
            this.container.classList.add('hidden');
    }
}