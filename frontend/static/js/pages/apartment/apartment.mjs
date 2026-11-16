import { ApartmentEvents, ProjectEvents, ModelErrorType } from "../../core/events.mjs";
import { ApartmentType, apartmentTypeLabel } from "../../apartment/type.mjs";
import { pretifyCost } from "../../utils/utils.mjs";
import { ApartmentToggledImages } from "./apartment-toggled-images.mjs";


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

        this.images = new ApartmentToggledImages({container: registry.get('apartment-images'), bus: bus});

        this.title = this.content.querySelector('[name="title"]');
        this.cost = this.content.querySelector('[name="cost"]');
        this.pdf = this.content.querySelector('[name="pdf"]');
        this.projectTitle = this.content.querySelector('[name="project-title"]');
        this.releaseDate = this.content.querySelector('[name="release-date"]');
        this.floor = this.content.querySelector('[name="floor"]');

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

        this.updateInfo();
        this.images.update(this.apartment, this.project);
        this.setState(this.project ? 'ready' : 'loading');
    }

    updateProject(project) {
        this.project = project;
        this.updateInfo();
        this.images.update(this.apartment, this.project);
        this.setState('ready');
    }

    updateInfo() {
        const apartment = this.apartment;
        const type = apartmentTypeLabel(apartment.type);
        const title = type ? (apartment.type === ApartmentType.Studio ? type : `${type} квартира`) : '—';
        this.title.textContent = `${title} ${apartment.square ?? '—'} м²`;

        const item = apartment.floors?.[0];
        this.cost.textContent = item ? `${pretifyCost(item.cost)} ₽` : 'Распродано';
        this.floor.textContent = item?.floor ?? '—';

        this.pdf.classList.toggle('hidden', !apartment.pdfUrl);
        if (apartment.pdfUrl)
            this.pdf.setAttribute('href', apartment.pdfUrl);
        else
            this.pdf.removeAttribute('href');

        this.projectTitle.textContent = this.project?.title || '—';
        this.releaseDate.textContent = this.project?.releaseDate || '—';
    }

    setState(state) {
        this.state = state;
        this.element.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
        this.loading.classList.toggle('hidden', state !== 'loading');
        this.content.classList.toggle('hidden', state !== 'ready');
        this.error.classList.toggle('hidden', state !== 'error');
    }
}
