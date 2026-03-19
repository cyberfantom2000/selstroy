
class Tag {
    constructor({text, template}) {
        this.fragment = template.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;
        this.text = this.fragment.querySelector('span');

        this.text.textContent = text;
    }
}


export class TagsContainer {
    constructor({container, template}) {
        this.container = container;
        this.template = template;
    }

    add(tags) {
        for (const tag of tags) {
            const item = this.buildItem(tag);
            this.container.appendChild(item.fragment);
        }
    }

    buildItem(text) {
        return new Tag({ text: text, template: this.template });
    }

    setVisible(visible) {
        if (visible)
            this.container.classList.remove('hidden');
        else
            this.container.classList.add('hidden');
    }

    clear() {
        while (this.container.firstChild)
            this.container.removeChild(this.container.firstChild);
    }
}