import { Timer } from "../utils/timer.mjs";
import { ModalEvents } from "../core/events.mjs";


class Slide {
    constructor({registry, data}) {
        this.element = registry.getTemplate('carousel-slide-template');
        this.url = data.url;
        this.element.querySelector('img').src = data.url;

        const imgRef = this.element.querySelector('[name="img-ref"]');
        if (data.href)
            imgRef.href = data.href;
        else
            imgRef.removeAttribute('href');

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


let carouselCounter = 0;


export class ImageCarousel {
    constructor({container, registry, bus = null, enlarge = false}) {
        this.container = container;
        this.registry = registry;
        this.bus = bus;
        this.enlarge = enlarge;
        this.carouselId = ++carouselCounter;

        this.slidesTrack = container.querySelector('[name="slides-track"]');
        this.dotsContainer = container.querySelector('[name="dots-container"]');

        this.slides = [];
        this.dots = [];
        this.activeSlideIndex = null;
        this.timer = null;

        if (this.enlarge && this.bus) {
            this.bus.on(ModalEvents.ImageGallery.Next, (payload) => this.galleryStep(payload, 1));
            this.bus.on(ModalEvents.ImageGallery.Previous, (payload) => this.galleryStep(payload, -1));
        }
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

            if (this.enlarge && this.bus) {
                const img = slide.element.querySelector('img');
                img.classList.add('cursor-pointer');
                img.onclick = (event) => {
                    event.preventDefault();
                    this.bus.emit(ModalEvents.ImageGallery.Open, slide.url, {carousel: this.carouselId, index: slideIndex});
                };
            }
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

    galleryStep(payload, delta) {
        if (!payload || payload.carousel !== this.carouselId || this.slides.length === 0)
            return;

        const next = (payload.index + delta + this.slides.length) % this.slides.length;
        this.bus.emit(ModalEvents.ImageGallery.Open, this.slides[next].url, {carousel: this.carouselId, index: next});
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
