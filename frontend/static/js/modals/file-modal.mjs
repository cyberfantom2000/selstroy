import { ModalWithTwoButtons } from "./modal.mjs";
import { isEmpty, toggleOutlineRed } from "../utils/utils.mjs";
import { ModalEvents } from "../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор файла из медиатеки.'
};


export class EditableFileModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('editable-file-modal'));

        this.bus = bus;
        this.payload = null;

        this.windowTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');

        this.id.addEventListener('input', () => toggleOutlineRed(this.id, isEmpty(this.id.value)));

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.bus.on(ModalEvents.EditableFile.Open, (payload) => this.openFile(payload));

        this.submitClicked = (data) => {
            if (this.payload)
                this.bus.emit(ModalEvents.EditableFile.Confirmed, {...this.payload, data});
            this.payload = null;
        };

        this.rejectClicked = () => {
            if (this.payload)
                this.bus.emit(ModalEvents.EditableFile.Rejected, this.payload);
            this.payload = null;
            this.resetInputOutline();
        };
    }

    openFile(payload) {
        this.payload = payload;

        this.setTitle(payload.title ?? 'Изменить файл');
        this.id.value = payload.data?.id ?? '';
        this.resetInputOutline();
        this.show();
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    data() {
        return {id: this.id.value.trim()};
    }

    validate() {
        const empty = isEmpty(this.id.value);
        toggleOutlineRed(this.id, empty);
        return !empty;
    }

    resetInputOutline() {
        toggleOutlineRed(this.id, false);
    }
}
