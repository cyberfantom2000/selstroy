import { EditableImage } from "../components/editable-image.mjs";


export class ImagesContainer {
    constructor({container, registry}) {
        this.container = container;
        this.registry = registry;
        this.addButton = this.container.querySelector('[name="add-button"]');
        this.items = new Map();
        
        this.imageAddClicked = null;
        this.imageClicked = null;
        this.imageRemoveClicked = null;
        this.imageEditClicked = null;

        this.addButton.onclick = () => { if (this.imageAddClicked) this.imageAddClicked(); };
    }

    update(images) {
        const newIds = new Set(images.map(i => i.id));
        for (const id of this.items.keys()) {
            if (!newIds.has(id))
                this.remove(id);
        }

        for (const data of images) {
            if (!this.items.has(data.id)) {
                const image = this.createImage();
                this.append(data.id, image);
            }
            this.items.get(data.id).update(data);
        }
    }

    createImage() {
        const image = new EditableImage(this.registry);
        image.clicked = (url) => { if (this.imageClicked) this.imageClicked(url); };
        image.editClicked = () => { if(this.imageEditClicked) this.imageEditClicked(image.data); };
        image.removeClicked = () => { if (this.imageRemoveClicked) this.imageRemoveClicked(image.data); };
        return image;
    }

    append(id, image) {
        this.container.insertBefore(image.element, this.addButton);
        this.items.set(id, image);
    }

    remove(id) {
        this.items.get(id).element.remove();
        this.items.delete(id);
    }
}