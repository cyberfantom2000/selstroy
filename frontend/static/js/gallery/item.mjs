export class GalleryItem {
    constructor(registry) {
        this.element = registry.getTemplate('gallery-item-template');
        this.image = this.element.querySelector('img');
        this.url = null;

        this.clicked = null;
        this.image.onclick = () => { if (this.clicked) { this.clicked(this.url); } };
    }

    update(data) {
        this.url = data.image.url;
        this.image.src = this.url;
    }
}