
export class Page {
    constructor({pageContainer, itemsContainer}) {
        this.pageContainer = pageContainer;
        this.itemsContainer = itemsContainer;
    }

    pushItemToFront(item) {
        this.itemsContainer.prepend(item.fragment);
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