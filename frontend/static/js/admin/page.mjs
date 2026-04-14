
export class Page {
    constructor({pageContainer, itemsContainer}) {
        this.id = pageContainer.id;
        this.pageContainer = pageContainer;
        this.itemsContainer = itemsContainer;
    }

    pushItemToFront(item) {
        this.itemsContainer.prepend(item);
    }

    clear() {
        while (this.itemsContainer.firstChild)
            this.itemsContainer.removeChild(this.itemsContainer.firstChild);
    }

    show() {
        this.pageContainer.classList.remove('hidden');
    }

    hide() {
        this.pageContainer.classList.add('hidden');
    }
}