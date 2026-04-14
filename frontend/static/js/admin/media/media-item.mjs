import { MediaEvents } from "../../core/events.mjs";

export class MediaItem {
    constructor({registry, bus}) {
        this.element = registry.getTemplate('media-item');
        this.bus = bus;
        
        this.title = this.element.querySelector('[name="title"]');
        this.img = this.element.querySelector('img');
        this.imagePlaceholder = this.element.querySelector('[name="image-placeholder"]');
        this.basePlaceholder = this.element.querySelector('[name="base-placeholder"]');
        this.copyButton = this.element.querySelector('[name="copy-button"]');
        this.linkButton = this.element.querySelector('[name="link-button"]');
        this.downloadButton = this.element.querySelector('[name="download-button"]');
        this.deleteButton = this.element.querySelector('[name="delete-button"]');

        this.imagePlaceholder.onclick = () => { this.bus.emit(MediaEvents.Request.Open, this.data); };
        this.basePlaceholder.onclick = () => { this.bus.emit(MediaEvents.Request.Open, this.data); };
        this.copyButton.onclick = () => { this.bus.emit(MediaEvents.Request.CopyId, this.data); };
        this.linkButton.onclick = () => { this.bus.emit(MediaEvents.Request.CopyLink, this.data); };
        this.downloadButton.onclick = () => { this.bus.emit(MediaEvents.Request.Download, this.data); };
        this.deleteButton.onclick = () => { this.bus.emit(MediaEvents.Request.Remove, this.data); };
    }

    update(data) {
        this.data = data;
        this.title.textContent = data.name + data.ext;
        this.title.title = data.name + data.ext;

        this.updateImage(data.isImage, data.url);
        this.updateVisibility(data.isImage);
        this.setButtonsEnabled(Boolean(data.id));
    }

    updateImage(isImage, url) {
        if (isImage && url)
            this.img.src = url;
    }

    updateVisibility(isImage) {
        if (isImage) {
            this.imagePlaceholder.classList.remove('hidden');
            this.basePlaceholder.classList.add('hidden');
        } else {
            this.imagePlaceholder.classList.add('hidden')
            this.basePlaceholder.classList.remove('hidden')
        }
    }

    setButtonsEnabled(enabled) {
        [this.copyButton, this.linkButton, this.downloadButton, this.deleteButton].forEach(btn => {
            btn.disabled = !enabled;
        });
    }
}