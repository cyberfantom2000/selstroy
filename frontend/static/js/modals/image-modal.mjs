import { ModalWithTwoButtons, Modal } from "./modal.mjs";
import { isEmpty, toggleOutlineRed } from "../utils/utils.mjs";
import { ModalEvents } from "../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор изображения из медиатеки.'
};


export class EditableImageModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('editable-image-modal'));
        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');

        this.id.addEventListener('input', () => toggleOutlineRed(this.id, isEmpty(this.id.value)));

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.bus.on(ModalEvents.EditableImage.Open, (payload) => {
            this.payload = payload;
            this.setTitle(payload.title ?? 'Изменить изображение');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => {
            if (this.payload)
                this.bus.emit(ModalEvents.EditableImage.Confirmed, {...this.payload, data: data});
            this.payload = null;
        };

        this.rejectClicked = () => {
            if (this.payload)
                this.bus.emit(ModalEvents.EditableImage.Rejected, this.payload);
            this.payload = null;
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.id.value = data.id ?? '';
    }

    data() {
        return {id: this.id.value};
    }

    validate() {
        toggleOutlineRed(this.id, isEmpty(this.id.value));
        return !isEmpty(this.id.value);
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input'))
            toggleOutlineRed(input, false);
    }
}


export class ImageViewModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('image-view-modal'));
        this.bus = bus;
        this.image = this.element.querySelector('img');

        this.bus.on(ModalEvents.ImageView.Open, (url) => {
            this.update(url);
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.ImageView.Rejected);
    }

    update(url) {
        this.image.src = url ?? '';
    }
}