import { ImagesContainer } from "../../components/images-container.mjs";


export class AdminProjectDetail {
    constructor(registry) {
        this.element = registry.getTemplate('project-detail-admin-template');

        this.imagesContainer = new ImagesContainer({
            container: this.element.querySelector('[name="images"]'),
            registry: registry
        });

        this.title = this.element.querySelector('[name="title"]');
        this.description = this.element.querySelector('[name="description"]');
        this.editButton = this.element.querySelector('[name="edit-button"]');
        this.removeButton = this.element.querySelector('[name="remove-button"]');

        this.editClicked = null;
        this.removeClicked = null;
        this.editButton.onclick = () => { if (this.editClicked) this.editClicked(); };
        this.removeButton.onclick = () => { if (this.removeClicked) this.removeClicked(); };

        this.imageClicked = null;
        this.imageAddClicked = null;
        this.imageEditClicked = null;
        this.imageRemoveClicked = null;
        this.imagesContainer.imageClicked = (url) => { if (this.imageClicked) this.imageClicked(url); };
        this.imagesContainer.imageAddClicked = () => { if (this.imageAddClicked) this.imageAddClicked(); };
        this.imagesContainer.imageEditClicked = (imgData) => { if (this.imageEditClicked) this.imageEditClicked(imgData); };
        this.imagesContainer.imageRemoveClicked = (imgData) => { if (this.imageRemoveClicked) this.imageRemoveClicked(imgData); };
    }

    update(data) {
        this.data = data;
        this.title.textContent = data.title ?? 'undefined';
        this.description.innerHTML = data.text ?? 'undefined';
        this.imagesContainer.update(data.images);
    }
}
