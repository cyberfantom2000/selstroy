import { ModalWithTwoButtons } from "./modal.mjs";
import { ModalEvents } from "../core/events.mjs";
import { isEmpty, toggleOutlineRed } from "../utils/utils.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'is-draft-tooltip': 'Черновик не отображается страницах, видимых пользователю. Подходит для того чтобы временно или постоянно скрыть элемент, не удаляя его.',
    'image-id-tooltip': 'Уникальный индентификатор медиафайла. Необходим для отображения изображения в элементе',
    'description-tooltip': 'Текст акции. Отображается в элементе. Для форматирования текста необходимо использовать html разметку и классы tailwind'
};


export class PromoModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('promo-modal'));

        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');
        this.draftCheckbox = this.element.querySelector('[name="is-draft-input"]');
        this.imageId = this.element.querySelector('[name="image-id-input"]');
        this.description = this.element.querySelector('[name="description-input"]');

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.bus.on(ModalEvents.Promo.Open, (payload) => {
            this.setTitle(payload.title);
            this.update(payload.data);
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.Promo.Confirmed, data);
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.Promo.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.id.textContent = data.id ?? '';
        this.draftCheckbox.checked = data.isDraft ?? true;
        this.imageId.value = data.imageId ?? '';
        this.description.value = data.text ?? '';
    }

    data() {
        let result = {
            isDraft: this.draftCheckbox.checked,
            imageId: this.imageId.value,
            text: this.description.value
        };

        if (this.id.textContent !== '')
            result.id = this.id.textContent;

        return result;
    }

    validate() {
        let ok = true;

        ok &&= !isEmpty(this.imageId.value);
        toggleOutlineRed(this.imageId, isEmpty(this.imageId.value));

        ok &&= !isEmpty(this.description.value);
        toggleOutlineRed(this.description, isEmpty(this.description.value));

        return ok;
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }
}