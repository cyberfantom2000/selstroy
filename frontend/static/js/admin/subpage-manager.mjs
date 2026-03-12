
const buttonKey = 'admin-active-button-id';

export class SubpageManager {
    constructor({mapping}) {
        this.activeButton = null;
        this.activePage = null;

        const activeButtonId = sessionStorage.getItem(buttonKey);

        for (const [buttonId, pageId] of Object.entries(mapping)) {
            const button = document.getElementById(buttonId);
            const page = document.getElementById(pageId);

            button.onclick = () => {
                this.switchActiveButton(button);
                this.switchActivePage(page);
            };

            if (activeButtonId && buttonId === activeButtonId)
                button.click();
        }
    }

    switchActivePage(page) {
        if (this.activePage !== null)
            this.activePage.classList.add('hidden');

        page.classList.remove('hidden');
        this.activePage = page;
    }

    switchActiveButton(button) {
        const classes = ['lg:text-primary-600', 'lg:dark:text-primary-400'];
        if (this.activeButton !== null)
            this.activeButton.classList.remove(...classes);

        button.classList.add(...classes);
        this.activeButton = button;
        sessionStorage.setItem(buttonKey, button.id);
    }
}