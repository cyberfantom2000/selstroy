export class GalleryItem {
    constructor(registry) {
        this.element = registry.getTemplate('gallery-item-template');
        this.image = this.element.querySelector('img');
        this.url = null;
        this.id = null;

        this.clicked = null;
        this.element.onclick = () => {
            if (this.clicked)
                this.clicked(this.url);
        };

        this.image.alt = '';
        this.image.loading = 'lazy';
        this.image.decoding = 'async';
        this.image.onerror = () => this.image.classList.add('hidden');
    }

    update(data) {
        this.id = data.id;
        this.url = data.image.url;
        this.image.classList.remove('hidden');
        this.image.src = this.url;
    }
}
