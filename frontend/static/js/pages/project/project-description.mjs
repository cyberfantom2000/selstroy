import { ProjectEvents } from "../../core/events.mjs";
import { ImageCarousel } from "../../components/carousel.mjs";
import { ApartmentsContainer } from "../../projects/apartments-container.mjs";


// TODO в отдельный файл
export class ProjectSlides {
    constructor(registry) {    
        this.carousel = new ImageCarousel({
            container: registry.get('project-carousel'),
            registry: registry
        });

        // TODO: move to Project constructor
        // this.bus.on(ProjectEvents.Update, (projects) => {
        //     const index = projects.findIndex(el => this.slug === el.slug);
        //     if (index !== -1)
        //         this.projectChanged(projects[index]);
        // });
    }

    update(project) {
        const slides = project.images.map((el) => { return {url: el.url} });
        this.carousel.clear();
        this.carousel.append(slides);
        this.carousel.play(60);
    }
}


// TODO: to separate file
export class ProjectDescription {
    constructor(registry) {
        this.element = registry.getTemplate('project-description-template');
        this.title = this.element.querySelector('[name="title"]');
        this.text = this.element.querySelector('[name="text"]');
        
        this.carousel = new ImageCarousel({
            container: this.element.querySelector('[name="carousel"]'),
            registry: registry
        });
    }

    update(data) {
        this.title.textContent = data.title ?? '';
        this.description.textContent = data.text ?? '';

        const hasntImages = data.images ? data.images.empty() : true;
        this.carousel.container.classList.toggle('hidden', hasntImages);
        if (!hasntImages) {
            const slides = data.images.map((el) => { return {url: el.url} });
            this.carousel.clear();
            this.carousel.append(slides);
            this.carousel.showFirst();
        }
    }
}


// TODO: to separate file
export class ProjectToggledImages {
    constructor(registry) {
        // TODO
    }
}

// TODO: to separate file
export class AppartmentsSearchFilter {
    constructor(registry) {
        // TODO
    }
}


export class Project {
    constructor({bus, registry, slug}) {
        this.title = registry.get('project-title');
        this.slides = new ProjectSlides(registry);
        this.mainDescription = new ProjectDescription(registry);
        this.toggledImages = new ProjectToggledImages(registry);
        this.searchFilter = new AppartmentsSearchFilter(register);
        this.additionalDescriptions = []; // [ProjectDescription]
        
        // this.apartsContainer = new ApartmentsContainer({ 
        //     container: registry.get('apartments-container'),
        //     registry: registry 
        // });
    }
}