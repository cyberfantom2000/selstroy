import { ApartmentEvents, ProjectEvents, ModelErrorType } from "../../core/events.mjs";


export class Apartment {
    constructor({bus, registry, slug}) {
        this.bus = bus;
        this.registry = registry;
        this.slug = slug;
        this.apartment = null;
        this.project = null;

        this.element = registry.get('apartment-page');
        this.loading = registry.get('apartment-loading');
        this.content = registry.get('apartment-content');
        this.error = registry.get('apartment-error');

        this.bus.on(ApartmentEvents.Update, (projectId, apartments) => {
            const apartment = apartments.find(el => el.slug === this.slug);
            if (apartment)
                this.update(apartment);
        });

        this.bus.on(ProjectEvents.Update, (projects) => {
            const project = projects.find(el => el.id === this.apartment?.projectId);
            if (project)
                this.updateProject(project);
        });

        this.bus.on(ApartmentEvents.Error, (type) => {
            if (type === ModelErrorType.Load)
                this.setState('error');
        });

        this.bus.on(ProjectEvents.Error, (type) => {
            if (type === ModelErrorType.Load && this.apartment)
                this.setState('error');
        });

        this.setState('loading');
    }

    update(apartment) {
        this.apartment = apartment;
        if (this.project?.id !== apartment.projectId)
            this.project = null;

        this.setState(this.project ? 'ready' : 'loading');
    }

    updateProject(project) {
        this.project = project;
        this.setState('ready');
    }

    setState(state) {
        this.state = state;
        this.element.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
        this.loading.classList.toggle('hidden', state !== 'loading');
        this.content.classList.toggle('hidden', state !== 'ready');
        this.error.classList.toggle('hidden', state !== 'error');
    }
}
