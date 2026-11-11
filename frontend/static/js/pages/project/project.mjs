import { ProjectEvents, SearchEvents } from "../../core/events.mjs";
import { ImageCarousel } from "../../components/carousel.mjs";
import { ApartmentsContainer } from "../../projects/apartments-container.mjs";
import { ProjectDescription } from "./project-description.mjs";
import { ProjectToggledImages } from "./project-toggled-images.mjs";


export class Project {
    constructor({bus, registry, slug}) {
        this.bus = bus;
        this.registry = registry;
        this.slug = slug;
        this.id = null;
        this.initialResultApplied = false;

        this.title = registry.get('project-title');

        this.slides = new ImageCarousel({
            container: registry.get('project-carousel'),
            registry: registry
        });

        this.mainDescription = new ProjectDescription({registry: registry});
        registry.get('project-description-container').appendChild(this.mainDescription.element);

        this.toggledImages = new ProjectToggledImages({
            container: registry.get('project-toggled-images-container'),
            bus: bus
        });

        this.detailsContainer = registry.get('project-details-container');
        this.additionalDescriptions = [];

        this.apartments = new ApartmentsContainer({
            container: registry.get('apartments-container'),
            registry: registry
        });

        this.bus.on(ProjectEvents.Update, (projects) => {
            const index = projects.findIndex(el => el.slug === this.slug);
            if (index !== -1)
                this.update(projects[index]);
        });

        this.bus.on(SearchEvents.Result, (projectId, apartments) => {
            if (projectId !== this.id || this.initialResultApplied)
                return;

            this.initialResultApplied = true;
            this.apartments.update(apartments);
        });

        this.bus.on(SearchEvents.Apply, (projectId, apartments) => {
            if (projectId !== this.id)
                return;

            this.apartments.update(apartments);
            this.scrollToApartments();
        });

        this.bus.on(SearchEvents.Error, () => {
            this.initialResultApplied = true;
        });
    }

    scrollToApartments() {
        document.getElementById('apartments-section')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }

    update(project) {
        this.id = project.id;

        this.title.textContent = project.title ?? '';

        const images = project.description?.images ?? [];
        this.slides.clear();
        this.slides.append(images.map(el => ({url: el.url})));
        this.slides.play(60);

        this.mainDescription.update({
            title: project.description?.title,
            text: project.description?.text,
            images: []
        });

        this.toggledImages.update(project);

        this.updateDetails(project.details ?? []);
    }

    updateDetails(details) {
        for (const description of this.additionalDescriptions)
            description.element.remove();
        this.additionalDescriptions = [];

        for (const detail of details) {
            const description = new ProjectDescription({registry: this.registry, bus: this.bus, enlarge: true});
            description.update({
                title: detail.title,
                text: detail.text,
                images: detail.images ?? []
            });
            this.additionalDescriptions.push(description);
            this.detailsContainer.appendChild(description.element);
        }
    }
}
