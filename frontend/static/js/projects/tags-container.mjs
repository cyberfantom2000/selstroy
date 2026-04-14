
class Tag {
    constructor({text, registry}) {
        this.element = registry.getTemplate('project-tag-template');
        this.text = this.element.querySelector('span');
        this.text.textContent = text;
    }
}


export class TagsContainer {
    constructor({container, registry}) {
        this.container = container;
        this.registry = registry;
    }

    add(tags) {
        for (const tag of tags) {
            const item = new Tag({text: tag, registry: this.registry})
            this.container.appendChild(item.element);
        }
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