
export class MenuHighlighter {
    constructor(menu) {
        this.paths = {
            '/': menu.querySelector('#menu-home'),
            '/projects': menu.querySelector('#menu-projects'),
            '/promo': menu.querySelector('#menu-promo'),
            '/gallery': menu.querySelector('#menu-gallery'),
            '/contacts': menu.querySelector('#menu-contacts'),
        };

        let path = location.pathname.replace(/\/$/, '') || '/';
        if (path.startsWith('/projects/') || path.startsWith('/apartments/'))
            path = '/projects';

        const activeLink = this.paths[path];

        if (activeLink) {
            activeLink.classList.remove('text-gray-500', 'dark:text-gray-400');
            activeLink.classList.add('text-primary-600', 'dark:text-primary-400');
            activeLink.setAttribute('aria-current', path === location.pathname ? 'page' : 'location');
        }
    }
}
