import { ApiUrls } from "../api/base-urls.mjs";


export class SoldOutApartmentItem {
    constructor({data, template}) {
        this.fragment = template.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;

        this.ref = this.fragment.querySelector('a');
        this.image = this.fragment.querySelector('img');

        this.update(data);
    }

    update(data) {
        this.ref.href = data.href ?? '';
        this.image.src = data.image_id ? `${ApiUrls.media}/${data.image_id}` : '';
    }
}