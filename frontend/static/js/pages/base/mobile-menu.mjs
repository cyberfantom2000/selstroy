export class MobileMenu {
    constructor(header) {
        this.header = header;

        this.button = this.header.querySelector('#mobile-menu-toggle');
        this.panel = this.header.querySelector('#site-navigation');
        this.overlay = this.header.querySelector('#mobile-menu-overlay');

        this.burgerIcon = this.button.querySelector('[name="burger-icon"]');
        this.closeIcon = this.button.querySelector('[name="close-icon"]');

        this.desktop = window.matchMedia('(min-width: 1024px)');
        this.isOpen = false;

        this.button.addEventListener('click', () => this.setOpen(!this.isOpen));
        this.overlay.addEventListener('click', () => this.setOpen(false));

        this.header.addEventListener('click', (event) => {
            if (event.target.closest('a'))
                this.setOpen(false);
        });

        this.desktop.addEventListener('change', () => {
            if (this.desktop.matches)
                this.setOpen(false);
        });

        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('pagehide', () => this.setOpen(false));
    }

    setOpen(open) {
        if (open === this.isOpen || (open && this.desktop.matches)) return;

        this.isOpen = open;

        this.panel.classList.toggle('hidden', !open);
        this.overlay.classList.toggle('hidden', !open);

        this.burgerIcon.classList.toggle('hidden', open);
        this.closeIcon.classList.toggle('hidden', !open);

        this.button.setAttribute('aria-expanded', String(open));
        this.button.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');

        if (open) {
            this.wasScrollLocked = document.documentElement.classList.contains('overflow-hidden');
            document.documentElement.classList.add('overflow-hidden');

            this.backgroundElements = [...document.querySelectorAll('body > main, body > footer')].map((element) => ({
                element,
                wasInert: element.inert,
            }));

            for (const { element } of this.backgroundElements)
                element.inert = true;
        } else {
            document.documentElement.classList.toggle('overflow-hidden', this.wasScrollLocked);

            for (const { element, wasInert } of this.backgroundElements)
                element.inert = wasInert;

            if (this.panel.contains(document.activeElement) && !this.desktop.matches)
                this.button.focus();
        }
    }

    onKeyDown(event) {
        if (!this.isOpen) return;

        if (event.key === 'Escape') {
            this.setOpen(false);
            this.button.focus();
        }

        if (event.key !== 'Tab') return;

        const links = [...this.header.querySelectorAll('a, button')].filter((element) => element.getClientRects().length);
        const first = links[0];
        const last = links[links.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}
