const tooltips = {
    'id-tooltip': 'Уникальный идентификатор проекта. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'title-tooltip': 'Заголовок проекта. Отоборажается на превью и на странице проекта',
    'square-min-tooltip': 'Минимальная площадь квартиры в проекте в метрах квадратных. Отображается в превью к проекту.',
    'square-max-tooltip': 'Максимальная площадь квартиры в проекте в метрах квадратных. Отображается в превью к проекту.',
    'release-date-tooltip': 'Дата сдачи проекта. Указывается произвольной строкой. Отображаетсяв превью к проекту и на странице проекта. Пример: 4 квартал 2025',
    'sale-status-tooltip': 'Статус проекта. Отоборажается на превью и на странице проекта. Пример: Открыты продажи',
    'slug-tooltip': 'Слаг - это часть адреса для идентификации конкретного проекта. Все проекты живут в /projects/<slug>. Пример: slug=korolev, тогда адрес проекта будет /projects/korolev.',
    'master-plan-id-tooltip': 'Уникальный идентификатор файла. Файл будет использован как генплан проекта. Отоборажается на странице проекта.',
    'preview-id-tooltip': 'Уникальный идентификатор файла. Файл будет использован как картинка-превью проекта.',
    'floor-svg-tooltip': 'Прямая вставка svg текста. Интерактивная карта этажа. Будет использована на странице проекта.',
    'live-map-tooltip': 'Прямая вставка iframe текста. Интерактивная карта расположения проекта. Будет использована на странице проекта.',
    'images-ids-tooltip': 'Перечисление уникальных идентификаторов файлов, которые будут использованы в качестве картинок основной карусели на странице проекта.',
    'is-draft-tooltip': 'Черновик не отображается страницах, видимых пользователю. Подходит для того чтобы временно или постоянно скрыть проект, не удаляя его.'
};

export class ProjectEditModal {
    constructor({modal, tooltip}) {
        this.element = modal;
        this.tooltip = tooltip;
        this.modalTitle = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');
        this.isDraft = this.element.querySelector('[name="is-draft-input"]');
        this.title = this.element.querySelector('[name="title-input"]');
        this.squareMin = this.element.querySelector('[name="square-min-input"]');
        this.squareMax = this.element.querySelector('[name="square-max-input"]');
        this.releaseDate = this.element.querySelector('[name="release-date-input"]');
        this.saleStatus = this.element.querySelector('[name="sale-status-input"]');
        this.masterPlanId = this.element.querySelector('[name="master-plan-id-input"]');
        this.previewId = this.element.querySelector('[name="preview-id-input"]');
        this.floorSvg = this.element.querySelector('[name="floor-svg-input"]');
        this.liveMap = this.element.querySelector('[name="live-map-input"]');
        this.imagesIds = this.element.querySelector('[name="images-ids-input"]');
        
        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => { this.tooltip.show(tooltips[button.name]); };

        for (const input of this.element.querySelectorAll('input[type="number"]'))
            input.addEventListener('input', (event) => { event.target.value = event.target.value.replace(/\D/g, '')});

        this.onSubmited = null;
        this.onRejected = null;

        this.element.querySelector('[name="submit-button"]').onclick = () => this.submit();
        this.element.querySelector('[name="reject-button"]').onclick = () => this.reject();
        this.element.querySelector('[name="background"]').onclick = () => this.reject();
    }

    setData(data) {
        this.id.textContent = data.id ?? '';
        this.isDraft.checked = data.is_draft ?? false;
        this.title.value = data.title ?? '';
        this.squareMin.value = data.square_min ?? '';
        this.squareMax.value = data.square_max ?? '';
        this.releaseDate.value = data.release_date ?? '';
        this.saleStatus.value = data.sale_status ?? '';
        this.masterPlanId.value = data.master_plan_id ?? '';
        this.previewId.value = data.preview_id ?? '';
        this.floorSvg.value = data.floor_svg ?? '';
        this.liveMap.value = data.live_map ?? '';
        this.imagesIds.value = data.images_id ? data.images_id.join(', ') : "";
    }

    clearData() {
        this.setData({});
    }

    data() {
        return {
            id: this.id.textContent,
            is_draft: this.isDraft.checked,
            title: this.title.value,
            square_min: this.squareMin.value,
            square_max: this.squareMax.value,
            release_date: this.releaseDate.value,
            sale_status: this.saleStatus.value,
            master_plan_id: this.masterPlanId.value,
            preview_id: this.previewId.value, 
            floor_svg: this.floorSvg.value,
            live_map: this.liveMap.value,
            images_ids: this.imagesIds.value.split(',').map(s => s.trim())
        };
    }

    setTitle(title) {
        this.modalTitle.textContent = title;
    }

    submit() {
        if (this.onSubmited !== null)
            this.onSubmited(this.data());

        this.hide();
    }

    reject() {
        if (this.onRejected !== null)
            this.onRejected();

        this.hide();
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}