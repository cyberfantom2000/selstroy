import { ModalWithTwoButtons } from "../../common/modal.mjs";
import { isEmpty, toggleOutlineRed } from "../../common/utils.mjs";
import { ModalEvents } from "../../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'apartment-id-tooltip': 'Уникальный идентификатор планировки. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'image-id-tooltip': 'Уникальный индентификатор медиафайла. Необходим для отображения изображения в элементе.',
    'category-tooltip': 'Категория изображения (тэг). Будет представлен как текст на кнопке для переключения изображения, например "Генплан", "Планировка" и т.д.',
};


export class ApartmentImageModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('apartment-image-modal'));
        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');

        this.id = this.element.querySelector('[name="id"]');
        this.apartmentId = this.element.querySelector('[name="apartment-id"]');
        this.imageId = this.element.querySelector('[name="image-id-input"]');
        this.category = this.element.querySelector('[name="category-input"]');

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.bus.on(ModalEvents.ApartmentImage.Open, (payload) => {
            this.setTitle(payload.title ?? 'Добавить изображение');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.ApartmentImage.Confirmed, data);
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.ApartmentImage.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.id.textContent = data.id ?? '';
        this.apartmentId.textContent = data.apartmentId ?? '';
        this.imageId.value = data.imageId ?? '';
        this.category.value = data.category ?? '';
    }

    data() {
        let result = {
            apartmentId: this.apartmentId.textContent,
            imageId: this.imageId.value,
            category: this.category.value
        };

        if (!isEmpty(this.id.textContent))
            result.id = this.id.textContent;
        
        return result;
    }

    validate() {
        let ok = true;

        ok &&= !isEmpty(this.imageId.value);
        toggleOutlineRed(this.imageId, isEmpty(this.imageId.value));

        ok &&= !isEmpty(this.category.value);
        toggleOutlineRed(this.category, isEmpty(this.category.value));

        return ok;
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }
}