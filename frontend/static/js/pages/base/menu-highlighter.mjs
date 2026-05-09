
export class MenuHighlighter {
    constructor(registry) {
        this.paths = {
            '/': registry.get('menu-home'),
            '/projects': registry.get('menu-projects'),
            '/promo': registry.get('menu-promo'),
            '/gallery': registry.get('menu-gallery'),
            '/contacts': registry.get('menu-contacts'),
        };

        const classes = ['text-primary-600', 'dark:text-primary-400'];

        this.paths[location.pathname]?.classList.add(...classes);
    }
}