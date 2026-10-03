import { ImageCarousel } from "../../components/carousel.mjs";


export class ProjectDescription {
    constructor({registry, bus = null, enlarge = false}) {
        this.element = registry.getTemplate('project-description-template');
        this.title = this.element.querySelector('[name="title"]');
        this.text = this.element.querySelector('[name="text"]');
        this.carousel = new ImageCarousel({
            container: this.element.querySelector('[name="carousel"]'),
            registry: registry,
            bus: bus,
            enlarge: enlarge
        });
    }

    update({title, text, images}) {
        this.title.textContent = title ?? '';
        this.text.textContent = text ?? '';

        const slides = images ?? [];
        this.carousel.clear();
        this.carousel.container.classList.toggle('hidden', slides.length === 0);
        if (slides.length > 0) {
            this.carousel.append(slides.map(el => ({url: el.url})));
            this.carousel.showFirst();
        }
    }
}
