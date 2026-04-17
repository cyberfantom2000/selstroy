import { Timer } from "../utils/timer.mjs";


class Slide {
    constructor({registry, data}) {
        this.element = registry.getTemplate('carousel-slide-template');
        this.element.querySelector('img').src = data.url;
        this.element.querySelector('[name="img-ref"]').href = data.href;
        if (data.btnLink) {
            const button = this.element.querySelector('[name="button"]');
            button.classList.remove('hidden');
            button.href = data.btnLink;
        }
    }
}


class DotButton {
    constructor(registry) {
        this.element = registry.getTemplate('carousel-dot-template');
        this.onclick = null;
        this.element.onclick = () => { if (this.onclick) this.onclick(); }
    }

    select() {
        this.element.classList.remove('bg-white/50');
        this.element.classList.add('bg-white');
    }

    deselect() {
        this.element.classList.add('bg-white/50');
        this.element.classList.remove('bg-white');
    }
}


export class ImageCarousel {
    constructor({container, registry}) {
        this.container = container;
        this.registry = registry;

        this.slidesTrack = container.querySelector('[name="slides-track"]');
        this.dotsContainer = container.querySelector('[name="dots-container"]');
        
        this.slides = [];
        this.dots = [];
        this.activeSlideIndex = [];
        this.timer = null;
    }

    showFirst() {
        this.swap(0);
    }

    play(delaySecs) {
        this.showFirst();

        this.timer = new Timer({delay: delaySecs * 1000, singleshot: false});
        this.timer.start(() => this.swap(this.activeSlideIndex + 1));
    }

    append(items) {
        for (const item of items) {
            const slide = new Slide({data: item, registry: this.registry});
            this.slides.push(slide);
            this.slidesTrack.appendChild(slide.element);

            const dot = new DotButton(this.registry);
            this.dots.push(dot);
            this.dotsContainer.appendChild(dot.element);

            const slideIndex = this.slides.length - 1;
            dot.onclick = () => { this.swap(slideIndex); };
        }
    }

    swap(index) {
        if (this.slides.length === 0)
            return;

        if (this.activeSlideIndex !== null)
            this.dots[this.activeSlideIndex].deselect();

        this.activeSlideIndex = index % this.slides.length;
        this.dots[this.activeSlideIndex].select();
        this.slidesTrack.style.transform = `translateX(-${this.activeSlideIndex * 100}%)`;
    }

    clear() {
        if (this.timer)
            this.timer.stop();

        this.activeSlideIndex = null;
        this.slides = [];
        this.dots = [];
        
        while (this.slidesTrack.firstChild)
            this.slidesTrack.removeChild(this.slidesTrack.firstChild);

        while (this.dotsContainer.firstChild)
            this.dotsContainer.removeChild(this.dotsContainer.firstChild)
    }
}