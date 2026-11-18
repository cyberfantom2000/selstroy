import { ApartmentEvents, ProjectEvents, ModelErrorType } from "../../core/events.mjs";
import { ApartmentType, apartmentTypeLabel } from "../../apartment/type.mjs";
import { pretifyCost } from "../../utils/utils.mjs";
import { ApartmentToggledImages } from "./apartment-toggled-images.mjs";


class FloorItem {
    constructor(registry) {
        this.element = registry.getTemplate('apartment-floor-template');
        this.floor = this.element.querySelector('[name="floor"]');
        this.cost = this.element.querySelector('[name="cost"]');
        this.onclick = null;
        this.element.onclick = () => this.onclick?.(this.id);
    }

    update(data) {
        this.id = data.id;
        this.floor.textContent = `Этаж ${data.floor}`;
        this.cost.textContent = `${pretifyCost(data.cost)} ₽`;
    }

    setSelected(selected) {
        this.element.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
}


export class Apartment {
    constructor({bus, registry, slug}) {
        this.bus = bus;
        this.registry = registry;
        this.slug = slug;
        this.apartment = null;
        this.project = null;
        this.selectedItemId = null;
        this.floorItems = [];

        this.element = registry.get('apartment-page');
        this.loading = registry.get('apartment-loading');
        this.content = registry.get('apartment-content');
        this.error = registry.get('apartment-error');

        this.images = new ApartmentToggledImages({container: registry.get('apartment-images'), bus: bus});

        this.title = this.content.querySelector('[name="title"]');
        this.cost = this.content.querySelector('[name="cost"]');
        this.pdf = this.content.querySelector('[name="pdf"]');
        this.booking = this.content.querySelector('[name="booking"]');
        this.bookingUrl = this.booking.getAttribute('href');
        this.projectTitle = this.content.querySelector('[name="project-title"]');
        this.releaseDate = this.content.querySelector('[name="release-date"]');
        this.floor = this.content.querySelector('[name="floor"]');
        this.number = this.content.querySelector('[name="number"]');
        this.floors = this.content.querySelector('[name="floors"]');

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
        const items = [...(apartment.floors ?? [])].sort((a, b) => b.floor - a.floor);
        let selectedItemId = items[0]?.id ?? null;
        const isSameApartment = this.apartment?.id === apartment.id;
        const selectedItemExists = items.some(item => item.id === this.selectedItemId);

        if (isSameApartment && selectedItemExists)
            selectedItemId = this.selectedItemId;

        this.apartment = apartment;
        if (this.project?.id !== apartment.projectId)
            this.project = null;

        this.updateFloors(items);
        this.updateInfo();
        this.selectItem(selectedItemId);
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

        this.pdf.classList.toggle('hidden', !apartment.pdfUrl);
        if (apartment.pdfUrl)
            this.pdf.setAttribute('href', apartment.pdfUrl);
        else
            this.pdf.removeAttribute('href');

        this.projectTitle.textContent = this.project?.title || '—';
        this.releaseDate.textContent = this.project?.releaseDate || '—';
    }

    updateFloors(floors) {
        const soldOut = floors.length === 0;
        this.booking.setAttribute('aria-disabled', soldOut ? 'true' : 'false');
        this.booking.setAttribute('tabindex', soldOut ? '-1' : '0');
        if (soldOut)
            this.booking.removeAttribute('href');
        else
            this.booking.setAttribute('href', this.bookingUrl);

        this.floors.replaceChildren();
        this.floorItems = [];

        if (floors.length === 0) {
            this.floors.appendChild(this.registry.getTemplate('apartment-floors-empty-template'));
            return;
        }

        for (const floor of floors) {
            const item = new FloorItem(this.registry);
            item.onclick = id => this.selectItem(id);
            item.update(floor);
            this.floors.appendChild(item.element);
            this.floorItems.push(item);
        }
    }

    selectItem(id) {
        this.selectedItemId = id;
        const item = this.apartment.floors?.find(item => item.id === id);
        this.cost.textContent = item ? `${pretifyCost(item.cost)} ₽` : 'Распродано';
        this.floor.textContent = item?.floor ?? '—';
        this.number.textContent = item?.number ?? '—';

        for (const item of this.floorItems)
            item.setSelected(item.id === id);
    }

    setState(state) {
        this.state = state;
        this.element.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
        this.loading.classList.toggle('hidden', state !== 'loading');
        this.content.classList.toggle('hidden', state !== 'ready');
        this.error.classList.toggle('hidden', state !== 'error');
    }
}
