import { ModalEvents, PopupEvents } from "../core/events.mjs";
import { Modal } from "../modals/modal.mjs";


export class GalleryPreview extends Modal {
    constructor({registry, bus}) {
        super(registry.get('gallery-preview-modal'));
            
        this.bus = bus;
        this.payload = {};

        this.nextButton = this.element.querySelector('[name="next-button"]');
        this.prevButton = this.element.querySelector('[name="prev-button"]');
        this.image = this.element.querySelector('img');
        this.extraInfo = this.element.querySelector('[name="extra-info"]');
        this.keyHandler = event => this.onKeyDown(event);
        this.touchStart = null;

        this.bus.on(ModalEvents.ImageGallery.Open, (url, payload) => {
            this.update(url, payload);
            this.show();
        });

        this.nextButton.onclick = () => this.bus.emit(ModalEvents.ImageGallery.Next, this.payload);
        this.prevButton.onclick = () => this.bus.emit(ModalEvents.ImageGallery.Previous, this.payload);

        this.image.onload = () => this.image.classList.remove('hidden');
        this.image.onerror = () => {
            if (!this.payload.url) return;

            this.image.classList.add('hidden');
            this.bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить изображение');
        };

        this.image.ontouchstart = event => {
            this.touchStart = event.touches.length === 1 ? event.touches[0] : null;
        };
        this.image.ontouchend = event => this.onTouchEnd(event);
        this.image.ontouchcancel = () => { this.touchStart = null; };
    }

    update(url, payload) {
        this.payload = {url: url, ...payload};
        this.image.classList.add('hidden');

        if (url)
            this.image.src = url;
        else
            this.image.removeAttribute('src');

        const navigable = this.payload.navigable !== false;
        this.nextButton.classList.toggle('hidden', !navigable);
        this.prevButton.classList.toggle('hidden', !navigable);

        const {index, total} = this.payload;
        this.extraInfo.textContent = total ? `${index + 1} / ${total}` : '';
        this.extraInfo.classList.toggle('hidden', !total);
    }

    show() {
        const opening = this.element.classList.contains('hidden');
        if (opening) {
            this.previousFocus = document.activeElement;
            this.wasScrollLocked = document.documentElement.classList.contains('overflow-hidden');
            document.documentElement.classList.add('overflow-hidden');
        }

        super.show();
        document.addEventListener('keydown', this.keyHandler);

        if (opening)
            this.closeButton.focus({preventScroll: true});
    }

    hide() {
        const wasOpen = !this.element.classList.contains('hidden');
        super.hide();
        document.removeEventListener('keydown', this.keyHandler);
        this.touchStart = null;
        this.update('', {});

        if (!wasOpen) return;

        document.documentElement.classList.toggle('overflow-hidden', this.wasScrollLocked);
        this.previousFocus?.focus({preventScroll: true});
        this.previousFocus = null;
    }

    onKeyDown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;

        if (event.key === 'ArrowRight' && !this.nextButton.classList.contains('hidden')) {
            event.preventDefault();
            this.nextButton.click();
        } else if (event.key === 'ArrowLeft' && !this.prevButton.classList.contains('hidden')) {
            event.preventDefault();
            this.prevButton.click();
        }

        if (event.key !== 'Tab') return;

        const buttons = [...this.element.querySelectorAll('button')].filter(button => !button.classList.contains('hidden'));
        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    onTouchEnd(event) {
        const start = this.touchStart;
        this.touchStart = null;
        if (!start || event.touches.length) return;

        const end = event.changedTouches[0];
        const dx = end.clientX - start.clientX;
        const dy = end.clientY - start.clientY;
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

        const button = dx < 0 ? this.nextButton : this.prevButton;
        if (!button.classList.contains('hidden'))
            button.click();
    }
}
