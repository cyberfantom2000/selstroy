import { ModalWithTwoButtons } from "./modal.mjs";
import { isEmpty, toggleOutlineRed } from "../utils/utils.mjs";
import { ModalEvents } from "../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'image-id-tooltip': 'Уникальный идентификатор изображения. Определяет конкретное изображение, можно получить в медиатеке.',
};


export class GalleryItemModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('gallery-item-modal'));

        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id"]');
        this.imageId = this.element.querySelector('[name="image-id-input"]');

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.bus.on(ModalEvents.GalleryItem.Open, (payload) => {
            this.setTitle(payload.title ?? 'Добавить элемент');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.GalleryItem.Confirmed, data);
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.GalleryItem.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.payload = data;
        this.id.textContent = data.id ?? '';
        this.imageId.value = data.image ? data.image.id : '';
    }

    data() {
        let result = {...this.payload};

        if (result.image)
            result.image.id = this.imageId.value;
        else
            result.image = {id: this.imageId.value};
        
        if (!isEmpty(this.id.textContent))
            result.id = this.id.textContent;

        return result;
    }

    validate() {
        toggleOutlineRed(this.imageId, isEmpty(this.imageId.value));
        return !isEmpty(this.imageId.value);
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input'))
            toggleOutlineRed(input, false);
    }
}