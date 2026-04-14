import { PromoItem } from "../../promo/promo-item.mjs";
import { PromoEvents } from "../../core/events.mjs";


export class AdminPromoItem {
    constructor({data, registry, bus}) {
        this.bus = bus;

        this.element = registry.getTemplate('promo-item-admin-template');
        this.container = this.element.querySelector('[name="item-container"]');
        this.editButton = this.element.querySelector('[name="edit-button"]');
        this.draftButton = this.element.querySelector('[name="draft-button"]');
        this.deleteButton = this.element.querySelector('[name="delete-button"]');

        this.baseItem = new PromoItem({ data: data, registry: registry });
        this.container.appendChild(this.baseItem.element);

        this.editButton.onclick = () => { this.bus.emit(PromoEvents.Request.Edit, this.data); };
        this.draftButton.onclick = () => { this.bus.emit(PromoEvents.Request.Draft, this.data); };
        this.deleteButton.onclick = () => { this.bus.emit(PromoEvents.Request.Remove, this.data); };

        this.update(data);
    }

    update(data) {
        this.data = data;
        this.baseItem.update(data);
        this.setDraftButtonSelect(data.isDraft);
    }

    setDraftButtonSelect(select) {
        if (select) {
            this.draftButton.title = 'Опубликовать'
            this.draftButton.classList.add('text-primary-500', 'dark:text-primary-500');
        } else {
            this.draftButton.title = 'Сделать черновиком'
            this.draftButton.classList.remove('text-primary-500', 'dark:text-primary-500');
        }
    }

    setButtonsEnabled(enaled) {
        this.editButton.enaled = enaled;
        this.draftButton.enaled = enaled;
        this.deleteButton.enabled = enaled;
    }
}