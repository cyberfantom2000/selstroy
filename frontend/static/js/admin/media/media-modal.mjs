
function prettySize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (bytes === null || bytes === undefined || isNaN(bytes)) return '—';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export class MediaModal {
    constructor({element}) {
        this.element = element;
        this.id = this.element.querySelector('[name="id"]');
        this.name = this.element.querySelector('[name="name"]');
        this.ext = this.element.querySelector('[name="ext"]');
        this.size = this.element.querySelector('[name="size"]');
        this.link = this.element.querySelector('[name="link"]');

        this.background = this.element.querySelector('[name="background"]');
        this.closeButton = this.element.querySelector('[name="close-button"]');
        this.imagePlaceholder = this.element.querySelector('[name="image-placeholder"]');
        this.basePlaceholder = this.element.querySelector('[name="base-placeholder"]');
        this.image = this.element.querySelector('img');

        this.background.onclick = () => this.hide();
        this.closeButton.onclick = () => this.hide();
    }

    show(item) {
        this.id.textContent = item.data.id ?? 'unknown';
        this.name.textContent = item.data.name ?? 'unknown';
        this.ext.textContent = item.data.ext ?? 'unknown';
        this.size.textContent = prettySize(item.data.size);
        this.link.textContent = item.absoluteLink ?? 'unknown';

        this.setImagePlaceholderVisible(item.isImage);
        this.setBasePlaceholderVisible(!item.isImage);

        if(item.isImage)
            this.image.src = item.relativeLink;

        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }

    setImagePlaceholderVisible(visible) {
        if (visible)
            this.imagePlaceholder.classList.remove('hidden');
        else
            this.imagePlaceholder.classList.add('hidden')
    }

    setBasePlaceholderVisible(visible) {
        if (visible)
            this.basePlaceholder.classList.remove('hidden');
        else
            this.basePlaceholder.classList.add('hidden')
    }
}