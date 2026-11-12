import { EditableFile } from "./editable-file.mjs";


export class EditableHtml extends EditableFile {
    constructor(element) {
        super(element);

        this.preview = element.querySelector('iframe');
        this.placeholder = element.querySelector('[name="placeholder"]');
        this.clicked = null;

        this.element.onclick = () => { if (this.clicked && this.data) this.clicked(this.data.url); };
    }

    update(data) {
        super.update(data);

        if (this.data) {
            this.preview.src = this.data.url;
            this.preview.classList.remove('hidden');
            this.placeholder.classList.add('hidden');
        } else {
            this.preview.src = 'about:blank';
            this.preview.classList.add('hidden');
            this.placeholder.classList.remove('hidden');
        }
    }
}
