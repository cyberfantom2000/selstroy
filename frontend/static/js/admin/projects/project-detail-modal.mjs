import { ModalWithTwoButtons } from "../../common/modal.mjs";
import { isEmpty, toggleOutlineRed } from "../../common/utils.mjs";
import { ModalEvents } from "../../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'title-tooltip': 'Заголовок элемента описание. Размещается в начале описания и выделяется особым шрифтом',
    'text-tooltip': 'Текст элемента описания. Основная информация описания.'
};


export class ProjectDetailModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('project-detail-modal'));

        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');
        this.title = this.element.querySelector('[name="title-input"]');
        this.text = this.element.querySelector('[name="text-input"]');

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        this.bus.on(ModalEvents.ProjectDetail.Open, (payload) => {
            this.setTitle(payload.title ?? 'Создать элемент описания');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.ProjectDetail.Confirmed, {...this.payload, ...data});
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.ProjectDetail.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.payload = data;
        this.id.textContent = data.id ?? '';
        this.title.value = data.title ?? '';
        this.text.value = data.text ?? '';
    }

    data() {
        let required = {
            text: this.text.value
        };

        const optional = {
            id: this.id.textContent,
            title: this.title.value
        };

        for (const [key, value] of Object.entries(optional)) {
            if (!isEmpty(value))
                required[key] = value;
        }
        
        return required;
    }

    validate() {
        toggleOutlineRed(this.text, isEmpty(this.text.value));
        return !isEmpty(this.text.value);
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }
}