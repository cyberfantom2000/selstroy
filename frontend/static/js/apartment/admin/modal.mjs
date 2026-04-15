import { ModalWithTwoButtons} from "../../common/modal.mjs";
import { isEmpty, isIntegerNumber, toggleOutlineRed } from "../../common/utils.mjs";
import { ModalEvents } from "../../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор планировки. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'project-id-tooltip': 'Уникальный идентификатор проекта. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'is-draft-tooltip': 'Черновик не отображается страницах, видимых пользователю. Подходит для того чтобы временно или постоянно скрыть элемент, не удаляя его.',
    'square-tooltip': 'Площадь квартиры. В метрах квадратных. Используется для отображения в информации о квартире.',
    'type-tooltip': 'Тип планировки. Используется для отображения в информации о квартире.',
    'total-floors-tooltip': 'Всего этажей в этой планировке. Используется для отображения в информации о квартире.',
    'slug-tooltip': 'Слаг страницы планировки. Используется для формирования URL страницы планировки. Должен быть уникальным среди всех планировок.',
    'pdf-id-tooltip': 'ID pdf файла из медиатеки. Прикрепляется на страницу квартиры для возможности скачивания описания.'
};


function inputNumberValidator(input) {
    toggleOutlineRed(input, !isIntegerNumber(input.value));
}


export class ApartmentModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('apartment-modal'));
        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');

        this.id = this.element.querySelector('[name="id-input"]');
        this.projectId = this.element.querySelector('[name="project-id-input"]');
        this.draftCheckbox = this.element.querySelector('[name="is-draft-input"]');
        this.square = this.element.querySelector('[name="square-input"]');
        this.typeSelect = this.element.querySelector('[name="type-select"]');
        this.totalFloors = this.element.querySelector('[name="total-floors-input"]');
        this.slug = this.element.querySelector('[name="slug-input"]');
        this.pdfId = this.element.querySelector('[name="pdf-id-input"]');
        
        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        for (const input of this.element.querySelectorAll('input[type="number"]'))
            input.addEventListener('input', () => inputNumberValidator(input));

        this.bus.on(ModalEvents.Apartment.Open, (payload) => {
            this.setTitle(payload.title ?? 'Создать планировку');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.Apartment.Confirmed, data);
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.Apartment.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.id.textContent = data.id ?? '';
        this.projectId.textContent = data.projectId ?? '';
        this.draftCheckbox.checked = data.isDraft ?? true;
        this.square.value = data.square ?? '';
        this.typeSelect.value = data.type ?? this.typeSelect.options[0].value;
        this.totalFloors.value = data.totalFloors ?? '';
        this.slug.value = data.slug ?? '';
        this.pdfId.value = data.pdfId ?? '';
    }

    data() {
        let required = {
            projectId: this.projectId.textContent,
            isDraft: this.draftCheckbox.checked,
            square: this.square.value,
            type: this.typeSelect.value,
            totalFloors: this.totalFloors.value,
            slug: this.slug.value
        };

        const optional = {
            id: this.id.textContent,
            pdfId: this.pdfId.value
        };

        for (const [key, value] of Object.entries(optional)) {
            if (!isEmpty(value))
                required[key] = value;
        }
        
        return required;
    }

    validate() {
        let ok = true;

        ok &&= isIntegerNumber(this.square.value);
        toggleOutlineRed(this.square, !isIntegerNumber(this.square.value));

        ok &&= isIntegerNumber(this.totalFloors.value);
        toggleOutlineRed(this.totalFloors, !isIntegerNumber(this.totalFloors.value));

        ok &&= !isEmpty(this.slug.value);
        toggleOutlineRed(this.slug, isEmpty(this.slug.value));

        return ok;
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }
}