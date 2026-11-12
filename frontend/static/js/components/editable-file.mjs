export class EditableFile {
    constructor(element) {
        this.element = element;
        this.editBtn = element.querySelector('[name="edit-button"]');
        this.removeBtn = element.querySelector('[name="remove-button"]');

        this.data = null;
        this.editClicked = null;
        this.removeClicked = null;

        this.editBtn.onclick = (event) => {
            event.stopPropagation();
            if (this.editClicked) this.editClicked();
        };

        if (this.removeBtn)
            this.removeBtn.onclick = (event) => {
                event.stopPropagation();
                if (this.removeClicked) this.removeClicked();
            };
    }

    setRemoveButtonVisible(visible) {
        if (!this.removeBtn)
            return;

        this.removeBtn.classList.toggle('hidden', !visible);
    }

    update(data) {
        this.data = data ?? null;

        if (this.removeBtn)
            this.removeBtn.disabled = !this.data;
    }
}
