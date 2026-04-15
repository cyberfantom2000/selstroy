import { ModalEvents } from "../core/events.mjs";
import { Modal } from "./modal.mjs";

function prettySize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (bytes === null || bytes === undefined || isNaN(bytes)) return '—';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}


export class MediaModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('media-modal'));
        this.bus = bus;
        
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

        this.background.onclick = () => this.reject();
        this.closeButton.onclick = () => this.reject();

        this.bus.on(ModalEvents.Media.Open, (payload) => {
            this.update(payload);
            this.show();
        });
    }

    update(data) {
        this.id.textContent = data.id;
        this.name.textContent = data.name;
        this.ext.textContent = data.ext;
        this.size.textContent = prettySize(data.size);
        this.link.textContent = data.absoluteUrl;

        this.updateImage(data.isImage, data.url);
        this.updateImageVisibility(data.isImage);
    }

    updateImage(isImage, url) {
        if (isImage && url)
            this.image.src = url;
    }

    updateImageVisibility(isImage) {
        if (isImage) {
            this.imagePlaceholder.classList.remove('hidden');
            this.basePlaceholder.classList.add('hidden')
        } else {
            this.imagePlaceholder.classList.add('hidden');
            this.basePlaceholder.classList.remove('hidden');
        }
    }
}