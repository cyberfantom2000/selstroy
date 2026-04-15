import { SubpageEvents } from "../core/events.mjs";


export class SubpageNavigator {
    constructor(bus) {
        this.bus = bus;
        this.activeButton = null;
        this.activePage = null;
        this.buttons = new Map();

        this.bus.on(SubpageEvents.Update,  (pageId) => {
            this.buttons.get(pageId)?.click();
        });
    }

    bind(button, page) {
        if (!button || !page)
            return;

        button.onclick = () => {
            this.switchActiveButton(button);
            this.switchActivePage(page);
        };
        this.buttons.set(page.id,  button);
    }

    switchActivePage(page) {
        if (this.activePage !== null)
            this.activePage.hide();

        this.activePage = page;
        this.activePage.show();
        
        this.bus.emit(SubpageEvents.Request.Update, this.activePage.id);
    }

    switchActiveButton(button) {
        const classes = ['lg:text-primary-600', 'lg:dark:text-primary-400'];
        if (this.activeButton !== null)
            this.activeButton.classList.remove(...classes);

        button.classList.add(...classes);
        this.activeButton = button;
    }
}