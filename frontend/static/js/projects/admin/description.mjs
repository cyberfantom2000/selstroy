export class AdminProjectDescription {
    constructor(element) {
        this.title = element.querySelector('[name="title"]');
        this.squareMin = element.querySelector('[name="square-min"]');
        this.squareMax = element.querySelector('[name="square-max"]');
        this.saleStatus = element.querySelector('[name="sale-status"]');
        this.slug = element.querySelector('[name="slug"]');
        this.tags = element.querySelector('[name="tags"]');
        this.editButton = element.querySelector('[name="edit-button"]');

        this.editClicked = null;
        this.editButton.onclick = () => { if (this.editClicked) this.editClicked(); };
    }

    update(data) {
        this.title.textContent = data.title ?? '';
        this.squareMin.textContent = data.squareMin ?? '';
        this.squareMax.textContent = data.squareMax ?? '';
        this.saleStatus.textContent = data.saleStatus ?? '';
        this.slug.textContent = data.slug ?? '';
        this.tags.textContent = data.tags ?? '';
    }
}