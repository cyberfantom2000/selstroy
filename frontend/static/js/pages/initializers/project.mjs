import { registry, bus } from "./base.mjs";

import { PopupEvents, ProjectEvents, ApartmentEvents } from "../../core/events.mjs";

import { ProjectApi } from "../../api/project.mjs";
import { ProjectStore } from "../../store/project.mjs";

import { ApartmentApi } from "../../api/apartment.mjs";
import { ApartmentStore } from "../../store/apartment.mjs";

import { ImageViewModal } from "../../modals/image-modal.mjs";
import { GalleryPreview } from "../../components/gallery-preview.mjs";

import { Project } from "../project/project.mjs";
import { ApartmentsSearchFilter } from "../project/apartments-filter.mjs";


const APARTMENT_TYPES = ['Студия', '1', '2', '3+'];


function createProject(registry, bus, slug) {
    try {
        registry.register('project-title', '#project-title');
        registry.register('project-carousel', '#project-carousel');
        registry.register('project-description-container', '#project-description-container');
        registry.register('project-toggled-images-container', '#project-toggled-images-container');
        registry.register('project-details-container', '#project-details-container');
        registry.register('apartments-container', '#apartments-container');

        registry.register('carousel-dot-template', '#carousel-dot-template');
        registry.register('carousel-slide-template', '#carousel-slide-template');
        registry.register('project-description-template', '#project-description-template');
        registry.register('apartment-item-template', '#apartment-item-template');

        const project = new Project({registry: registry, bus: bus, slug: slug});

        bus.on(ProjectEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить проект. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        bus.on(ApartmentEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить квартиры. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        return project;
    } catch (err) {
        console.log(err);
    }
}


function createFilter(registry) {
    try {
        registry.register('apartments-filter-container', '#apartments-filter-container');
        registry.register('apartments-filter-template', '#apartments-filter-template');
        registry.register('apartments-filter-type-template', '#apartments-filter-type-template');

        const filter = new ApartmentsSearchFilter({
            registry: registry,
            types: APARTMENT_TYPES
        });

        registry.get('apartments-filter-container').appendChild(filter.element);
        return filter;
    } catch (err) {
        console.log(err);
    }
}


function createImageViewModal(registry, bus) {
    try {
        registry.register('image-view-modal', '#image-view-modal');
        return new ImageViewModal({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
        return null;
    }
}


function createGalleryPreview(registry, bus) {
    try {
        registry.register('gallery-preview-modal', '#gallery-preview-modal');
        return new GalleryPreview({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
        return null;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const projectApi = new ProjectApi();
    const projectStore = new ProjectStore({api: projectApi, bus: bus});

    const apartmentApi = new ApartmentApi();
    const apartmentStore = new ApartmentStore({api: apartmentApi, bus: bus});

    const path = window.location.pathname;
    const segments = path.split('/').filter(seg => seg !== '');
    const slug = segments[segments.length - 1];

    const project = createProject(registry, bus, slug);
    createFilter(registry);
    createImageViewModal(registry, bus);
    createGalleryPreview(registry, bus);

    projectStore.loadBySlug(slug).then(() => {
        apartmentStore.load();
    });
});
