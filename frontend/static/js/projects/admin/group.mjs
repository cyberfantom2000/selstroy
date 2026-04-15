import { AdminProjectItem } from "./item.mjs";
import { AdminApartmentsContainer } from "./apartments-container.mjs";
import { ApartmentEvents } from "../../core/events.mjs";


export class AdminProjectGroup {
    constructor({ registry, bus }) {    
        this.registry = registry;
        this.bus = bus;
        this.element = registry.getTemplate('project-group-admintemplate');

        this.project = new AdminProjectItem({registry: registry, bus: bus});
        this.element.querySelector('[name="project-container"]').appendChild(this.project.element);

        this.apartments = new AdminApartmentsContainer({
            element: this.element.querySelector('[name="apartments-container"]'),
            registry: registry, 
            bus: bus
        });

        this.apartments.createClicked = () => this.bus.emit(ApartmentEvents.Request.Apartment.Create, {projectId: this.project.data.id});
    }

    updateProject(data) {
        this.project.update(data);
    }

    updateApartments(data) {
        this.apartments.update(data);
    }
};