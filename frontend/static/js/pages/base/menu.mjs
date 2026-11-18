import { MenuHighlighter } from './menu-highlighter.mjs';
import { MobileMenu } from './mobile-menu.mjs';


export class Menu {
    constructor(registry) {
        this.element = registry.get('site-header');

        this.highlighter = new MenuHighlighter(this.element.querySelector('#site-navigation'));
        this.mobileMenu = new MobileMenu(this.element);
    }
}
