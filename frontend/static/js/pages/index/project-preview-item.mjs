

export class ProjectPreviewItem {
    constructor(registry) {
        this.registry = registry;
        this.element = registry.getTemplate('project-preview-template');

        this.image = this.element.querySelector('img');
        this.href = this.element.querySelector('a');
        this.title = this.element.querySelector('[name="title"]');
        this.extraTitle = this.element.querySelector('[name="extra-title"]');
        this.descriptionContainer = this.element.querySelector('[name="description-container"]');
    }

    update(data) {
        this.image.src = data.previewImage ? data.previewImage.url : '';
        this.href.href = data.url ?? 'unknown';
        this.title.textContent = data.title;
        this.extraTitle.textContent = `Сдача: ${data.releaseDate}`;

        this.addDescription(`Статус: ${data.saleStatus}`);
        this.addDescription(`Площадь: от ${data.squareMin} до ${data.squareMax} м²`)
    }

    addDescription(text) {
        let el = this.registry.getTemplate('project-preview-description-template');
        el.textContent = text;
        this.descriptionContainer.appendChild(el);
    }
}