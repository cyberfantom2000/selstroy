export class EditableIFrame {
    constructor(registry) {
        this.element = registry.getTemplate('editable-iframe-template');
        this.container = this.element.querySelector('[name="iframe-container"]');
        this.editBtn = this.element.querySelector('[name="edit-button"]');
    
        this.clicked = null;
        this.editClicked = null;
        
        this.container.onclick = () => { if (this.clicked) this.clicked(); };
        this.editBtn.onclick = () => { if (this.editClicked) this.editClicked(); };
    }

    update(data) {
        this.data = data ?? '';
        this.container.innerHTML = this.data;

        this.container.firstElementChild?.classList.add('w-full', 'h-full');
        this.container.firstElementChild?.removeAttribute('width');
        this.container.firstElementChild?.removeAttribute('height');
    }
}
