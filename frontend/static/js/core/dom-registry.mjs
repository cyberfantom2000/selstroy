export class DomRegistry {
    constructor() {
        this.storage = new Map();
    }

    register(name, selector) {
        this.storage.set(name, document.querySelector(selector));
    }

    get(name) {
        return this.storage.get(name);
    }

    getTemplate(name) {
        return this.storage.get(name).content.cloneNode(true).firstElementChild;
    }
}