import { EditableFile } from "./editable-file.mjs";


export class EditableImage extends EditableFile {
    constructor(element) {
        super(element);

        this.image = element.querySelector('img');
        this.clicked = null;

        this.image.onclick = () => { if (this.clicked && this.data) this.clicked(this.data.url); };
    }

    update(data) {
        super.update(data);

        if (this.data) {
            this.image.src = this.data.url;
            this.image.title = this.data.category ?? '';
        } else {
            this.image.removeAttribute('src');
            this.image.title = '';
        }
    }
}
