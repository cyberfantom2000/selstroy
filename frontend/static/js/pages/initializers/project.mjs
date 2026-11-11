import { registry, bus } from "./base.mjs";

import { PopupEvents, ProjectEvents, ApartmentEvents, SearchEvents } from "../../core/events.mjs";

import { ProjectApi } from "../../api/project.mjs";
import { ProjectStore } from "../../store/project.mjs";

import { ApartmentApi } from "../../api/apartment.mjs";
import { ApartmentStore } from "../../store/apartment.mjs";
import { SearchApi } from "../../api/search.mjs";

import { GalleryPreview } from "../../components/gallery-preview.mjs";
import { ApartmentsFilter } from "../../components/apartments-filter.mjs";

import { Project } from "../project/project.mjs";


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

        bus.on(ProjectEvents.Error, (type, err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить проект. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        bus.on(ApartmentEvents.Error, (type, err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить квартиры. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        bus.on(SearchEvents.Error, (type, err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось выполнить поиск квартир. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        return project;
    } catch (err) {
        console.log(err);
    }
}


function createFilter(registry, bus) {
    try {
        registry.register('apartments-filter-container', '#apartments-filter-container');
        registry.register('apartments-filter-template', '#apartments-filter-template');
        registry.register('apartments-filter-type-template', '#apartments-filter-type-template');

        return new ApartmentsFilter({
            container: registry.get('apartments-filter-container'),
            registry: registry,
            bus: bus,
        });
    } catch (err) {
        console.log(err);
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
    const searchApi = new SearchApi();
    const apartmentStore = new ApartmentStore({api: apartmentApi, searchApi: searchApi, bus: bus});

    const path = window.location.pathname;
    const segments = path.split('/').filter(seg => seg !== '');
    const slug = segments[segments.length - 1];

    const project = createProject(registry, bus, slug);
    createFilter(registry, bus);
    createGalleryPreview(registry, bus);

    let projectId = null;

    bus.on(SearchEvents.Request, (filters) => {
        if (projectId)
            apartmentStore.search(projectId, filters);
    });

    projectStore.loadBySlug(slug).then((project) => {
        if (!project)
            return;

        projectId = project.id;
        apartmentStore.loadFilters(projectId);
        apartmentStore.search(projectId, {});
    });
});
