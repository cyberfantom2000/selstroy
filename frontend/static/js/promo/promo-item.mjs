import { mediaUrl } from "../api/base-urls.mjs";


export class PromoItem {
    constructor({data, template}) {
        this.fragment = template.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;

        this.image = this.fragment.querySelector('img');
        this.description = this.fragment.querySelector('[name="description"]');

        this.update(data);
    }

    update(data) {
        this.image.src = data.image ? `${mediaUrl}/${data.image.id}` : ''
        this.description.innerHTML = data.text ?? 'unknown';
    }
}