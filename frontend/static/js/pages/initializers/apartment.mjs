import { registry, bus } from "./base.mjs";

import { ApartmentEvents, ProjectEvents, PopupEvents, ModelErrorType } from "../../core/events.mjs";
import { ApartmentApi } from "../../api/apartment.mjs";
import { ApartmentStore } from "../../store/apartment.mjs";
import { ProjectApi } from "../../api/project.mjs";
import { ProjectStore } from "../../store/project.mjs";
import { Apartment } from "../apartment/apartment.mjs";


document.addEventListener("DOMContentLoaded", async () => {
    const apartmentApi = new ApartmentApi();
    const apartmentStore = new ApartmentStore({api: apartmentApi, bus: bus});
    const projectApi = new ProjectApi();
    const projectStore = new ProjectStore({api: projectApi, bus: bus});

    const segments = window.location.pathname.split('/').filter(seg => seg !== '');
    const slug = segments[segments.length - 1];

    registry.register('apartment-page', '#apartment-page');
    registry.register('apartment-loading', '#apartment-loading');
    registry.register('apartment-content', '#apartment-content');
    registry.register('apartment-error', '#apartment-error');

    const apartment = new Apartment({registry: registry, bus: bus, slug: slug});

    bus.on(ApartmentEvents.Error, (type, err) => {
        if (type !== ModelErrorType.Load)
            return;

        console.log(err);
        bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить квартиру. Попробуйте обновить страницу или возвращайтесь позднее');
    });

    bus.on(ProjectEvents.Error, (type, err) => {
        if (type !== ModelErrorType.Load)
            return;

        console.log(err);
        bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить проект квартиры. Попробуйте обновить страницу или возвращайтесь позднее');
    });

    const loadedApartment = await apartmentStore.loadBySlug(slug);
    if (loadedApartment)
        await projectStore.loadById(loadedApartment.projectId);
});
