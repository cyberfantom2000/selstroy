import { ApartmentItem } from "../apartment/apartment-item.mjs";
import { SoldOutApartmentItem } from "../apartment/sold-out-apartment-item.mjs";


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
        return new ApartmentItem({ 
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
        return new SoldOutApartmentItem({
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