import { registry, bus } from "./base.mjs";

import { PopupEvents, ProjectEvents, ApartmentEvents } from "../../core/events.mjs";

import { ProjectApi } from "../../api/project.mjs";
import { ProjectStore } from "../../store/project.mjs";

import { ApartmentApi } from "../../api/apartment.mjs";
import { ApartmentStore } from "../../store/apartment.mjs";

import { ProjectGroupContainer } from "../projects/group-container.mjs";


function createProjectGroupContainer(registry, bus) {
    try {
        registry.register('project-group-container', '#project-group-container');
        registry.register('project-group-template', '#project-group-template');
        registry.register('project-item-template', '#project-item-template');
        registry.register('project-tag-template', '#project-tag-template');
        registry.register('apartment-item-template', '#apartment-item-template');
        const groupContainer = new ProjectGroupContainer({registry: registry, bus: bus});

        bus.on(ProjectEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить список проектов. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        bus.on(ApartmentEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить список квартир. Попробуйте обновить страницу или возвращайтесь позднее');
        });
        
        return groupContainer;
    } catch (err) {
        console.log(err);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const projectApi = new ProjectApi();
    const projectStore = new ProjectStore({api: projectApi, bus: bus});

    const apartmentApi = new ApartmentApi();
    const apartmentStore = new ApartmentStore({api: apartmentApi, bus: bus});
 
    const groupContainer = createProjectGroupContainer(registry, bus);
    
    projectStore.load().then(() => { apartmentStore.load(); });
});