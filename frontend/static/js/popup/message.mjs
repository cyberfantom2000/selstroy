export class PopupMessage {
    constructor({data, registry}) {
        this.element = registry.getTemplate('popup-message');
        this.title = this.element.querySelector('[name="title"]');
        this.text = this.element.querySelector('[name="text"]');
        this.progress = this.element.querySelector('[name="progress-bar"]');
        
        this.closeClicked = null;
        this.element.querySelector('[name="close-button"]').onclick = () => {
            if (this.closeClicked)
                this.closeClicked();
        };

        this.hover = null;
        this.hoverEnd = null;
        this.element.onmouseenter = () => { if (this.hover) this.hover(); }
        this.element.onmouseleave = () => { if (this.hoverEnd) this.hoverEnd(); }
        
        this.update(data);
    }

    isSameData(data) {
        return this.data && data && this.data.text === data.text && this.data.title === this.data.title && this.data.context.type === data.context.type;
    }

    update(data) {
        this.data = data;
        this.title.textContent = data.title;
        this.text.textContent = data.text;
        this.setStyle(data.style);
    }

    startProgressAnimation(duration) {
        this.setProgressBarVisible(true);
        this.progress.style.transition = `width ${duration}ms linear`;
        this.progress.style.width = '100%';

        // Double request so that the browser has time to apply the previous style
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.progress.style.width = '0%';
            });
        });
    }

    stopProgressAnimation() {
        this.progress.style.transition = 'none';
        this.progress.style.width = '100%';
    }

    setStyle(style) {
        if (style === 'warning') {
            this.element.classList.add('bg-yellow-400/80');
        } else if (style === 'danger') {
            this.element.classList.add('bg-red-300/80');
        } else {
            this.element.classList.add('bg-gray-320/80');
        }
    }

    destroy() {
        this.element.remove();
    }

    fadeOut() {
        this.element.classList.remove('opacity-100', 'translate-y-0');
        this.element.classList.add('opacity-0', 'translate-y-2');
    }

    setProgressBarVisible(visible) {
        if (visible)
            this.progress.parentElement.classList.remove('hidden');
        else
            this.progress.parentElement.classList.add('hidden');
    }
}