import { ModalWithTwoButtons, Modal } from "./modal.mjs";
import { ModalEvents } from "../core/events.mjs";
import { toggleOutlineRed } from "../utils/utils.mjs";


const tooltips = {
    'content-tooltip': 'Элемент HTML. Нажмите кнопку "Предпросмотр" чтобы отобразить элемент на текущей странице',
};


export class EditableIFrameModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('editable-iframe-modal'));
        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');
        this.preview = this.element.querySelector('[name="content-preview"]');
        this.showPreviewButton = this.element.querySelector('[name="preview-button"]');

        this.content = this.element.querySelector('[name="content-input"]');

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.showPreviewButton.onclick = () => this.updatePreview();

        this.bus.on(ModalEvents.EditableIFrame.Open, (payload) => {
            this.payload = payload;
            this.setTitle(payload.title ?? 'Изменить элемент');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => {
            if (this.payload)
                this.bus.emit(ModalEvents.EditableIFrame.Confirmed, {...this.payload, data: data});
            this.payload = null;
        };

        this.rejectClicked = () => {
            if (this.payload)
                this.bus.emit(ModalEvents.EditableIFrame.Rejected, this.payload);
            this.payload = null;
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(text) {
        this.content.value = text ?? '';
        this.updatePreview();
    }

    data() {
        return this.content.value;
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input'))
            toggleOutlineRed(input, false);
    }

    updatePreview() {
        this.preview.innerHTML = this.content.value;
    }
}


export class IFrameViewModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('iframe-view-modal'));
        this.bus = bus;
        this.image = this.element.querySelector('img');
        this.container = this.element.querySelector('[name="iframe-container"]');

        this.element.querySelector('[name="background"]').onclick = () => this.reject();
        this.element.querySelector('[name="close-button"]').onclick = () => this.reject();

        this.bus.on(ModalEvents.IFrameView.Open, (url) => {
            this.update(url);
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.IFrameView.Rejected);
    }

    update(data) {
        this.container.innerHTML = data ?? '';
        this.container.firstElementChild?.classList.add('w-full', 'h-full');
        this.container.firstElementChild?.removeAttribute('width');
        this.container.firstElementChild?.removeAttribute('height');
    }
}