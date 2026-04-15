import { ModalWithTwoButtons } from "./modal.mjs";
import { isEmpty, isNumber, toggleOutlineRed } from "../utils/utils.mjs";
import { ModalEvents } from "../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор проекта. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'title-tooltip': 'Заголовок проекта. Отоборажается на превью и на странице проекта',
    'square-min-tooltip': 'Минимальная площадь квартиры в проекте в метрах квадратных. Отображается в превью к проекту.',
    'square-max-tooltip': 'Максимальная площадь квартиры в проекте в метрах квадратных. Отображается в превью к проекту.',
    'release-date-tooltip': 'Дата сдачи проекта. Указывается произвольной строкой. Отображаетсяв превью к проекту и на странице проекта. Пример: 4 квартал 2025',
    'sale-status-tooltip': 'Статус проекта. Отоборажается на превью и на странице проекта. Пример: Открыты продажи',
    'slug-tooltip': 'Слаг - это часть адреса для идентификации конкретного проекта. Все проекты живут в /projects/<slug>. Пример: slug=korolev, тогда адрес проекта будет /projects/korolev.',
    'tags-tooltip': 'Тэги - отображаются на странице проекта и его превью. Небольшие слова, которые создают ассоциацию с проектом. Например: "ул. Королева 15", "Открыты продажи" и т.д.',
    'is-draft-tooltip': 'Черновик не отображается страницах, видимых пользователю. Подходит для того чтобы временно или постоянно скрыть проект, не удаляя его.'
};


function inputNumberValidator(input) {
    toggleOutlineRed(input, !Number(input.value));
}


export class ProjectModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('project-modal'));
        
        this.bus = bus;
        
        this.windowTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');
        this.isDraft = this.element.querySelector('[name="is-draft-input"]');
        this.title = this.element.querySelector('[name="title-input"]');
        this.squareMin = this.element.querySelector('[name="square-min-input"]');
        this.squareMax = this.element.querySelector('[name="square-max-input"]');
        this.releaseDate = this.element.querySelector('[name="release-date-input"]');
        this.slug = this.element.querySelector('[name="slug-input"]');
        this.tags = this.element.querySelector('[name="tags-input"]');
        this.saleStatus = this.element.querySelector('[name="sale-status-input"]');
        
        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        for (const input of this.element.querySelectorAll('input[type="number"]'))
            input.addEventListener('input', () => inputNumberValidator(input));

        this.bus.on(ModalEvents.Project.Open, (payload) => {
            this.setTitle(payload.title);
            this.update(payload.data);
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.Project.Confirmed, data);
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.Project.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(title) {
        this.windowTitle.textContent = title;
    }

    update(data) {
        this.id.textContent = data.id ?? '';
        this.isDraft.checked = data.isDraft ?? true;
        this.title.value = data.title ?? '';
        this.squareMin.value = data.squareMin ?? '';
        this.squareMax.value = data.squareMax ?? '';
        this.releaseDate.value = data.releaseDate ?? '';
        this.slug.value = data.slug ?? '';
        this.tags.value = data.tags ?? '';
        this.saleStatus.value = data.saleStatus ?? '';
    }

    data() {
        let result = {
            isDraft: this.isDraft.checked,
            title: this.title.value,
            squareMin: this.squareMin.value,
            squareMax: this.squareMax.value,
            releaseDate: this.releaseDate.value,
            saleStatus: this.saleStatus.value,
            slug: this.slug.value
        };

        if (this.id.textContent !== '')
            result.id = this.id.textContent;
        if (this.tags.value !== '')
            result.tags = this.tags.value;

        return result;
    }

    validate() {
        let ok = true;

        ok &&= isNumber(this.squareMin.value);
        toggleOutlineRed(this.squareMin, !isNumber(this.squareMin.value));

        ok &&= isNumber(this.squareMin.value);
        toggleOutlineRed(this.squareMax, !isNumber(this.squareMax.value));

        ok &&= !isEmpty(this.title.value);
        toggleOutlineRed(this.title, isEmpty(this.title.value));

        ok &&= !isEmpty(this.releaseDate.value);
        toggleOutlineRed(this.releaseDate, isEmpty(this.releaseDate.value));

        ok &&= !isEmpty(this.saleStatus.value);
        toggleOutlineRed(this.saleStatus, isEmpty(this.saleStatus.value));

        ok &&= !isEmpty(this.slug.value);
        toggleOutlineRed(this.slug, isEmpty(this.slug.value));

        return ok;
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }
}
