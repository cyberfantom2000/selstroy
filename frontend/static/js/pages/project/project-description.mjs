import { ProjectEvents } from "../../core/events.mjs";
import { ImageCarousel } from "../../components/carousel.mjs";


// TODO в отдельный файл
export class ProjectSlides {
    constructor({bus, registry, slug}) {
        this.bus = bus;
        this.registry = registry;
        this.slug = slug;
        
        const container = this.registry.get('project-carousel-container')
        this.carousel = new ImageCarousel({
            container: container,
            registry: registry
        });

        this.title = container.querySelector('[name="title"]')

        this.bus.on(ProjectEvents.Update, (projects) => {
            const index = projects.findIndex(el => this.slug === el.slug);
            if (index !== -1)
                this.projectChanged(projects[index]);
        });
    }

    projectChanged(project) {
        const slides = projects.images.map((el) => { return {url: el.url} });
        this.carousel.clear();
        this.carousel.append(slides);
        this.carousel.play(30);
        this.title.textContent = project.title;
    }

}

export class ProjectDescription {
    constructor({bus, registry, slug}) {
        this.slides = new ProjectSlides({bus, registry, slug});
    }
}