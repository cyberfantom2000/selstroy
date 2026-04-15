

export class EditableImage {
    constructor(registry) {
        this.element = registry.getTemplate('editable-image-template');

        this.image = this.element.querySelector('img');
        this.editBtn = this.element.querySelector('[name="edit-button"]');
        this.removeBtn = this.element.querySelector('[name="remove-button"]');

        this.clicked = null;
        this.editClicked = null;
        this.removeClicked = null;
        
        this.editBtn.onclick = () => { if (this.editClicked) this.editClicked(); };
        this.removeBtn.onclick = () => { if (this.removeClicked) this.removeClicked(); };
    }

    update(data) {
        if (data) {
            this.data = data;
            this.image.src = this.data.url;
            this.image.title = this.data.category ?? '';
            this.image.onclick = () => { if (this.clicked) this.clicked(this.data.url); };
            this.removeBtn.enabled = true;
        } else {
            this.element.onclick = null;
            this.removeBtn.enabled = false;
        }
    }

    setRemoveButtonVisible(visible) {
        if (visible)
            this.removeBtn.classList.remove('hidden');
        else
            this.removeBtn.classList.add('hidden');
    }
}