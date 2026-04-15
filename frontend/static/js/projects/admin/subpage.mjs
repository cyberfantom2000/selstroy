import { Page } from "../../pages/page.mjs";
import { AdminProjectGroup } from "./group.mjs";
import { ProjectEvents, ApartmentEvents } from "../../core/events.mjs";


export class AdminProjectsSubpage extends Page {
    constructor({registry, bus}) {
        super({pageContainer: registry.get('projects-subpage'), itemsContainer: registry.get('projects-subpage-container')});
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.createButton = registry.get('create-project-button');
        this.createButton.onclick = () => this.bus.emit(ProjectEvents.Request.Project.Create);

        this.bus.on(ProjectEvents.Update, (projects) => this.projectsChanged(projects));
        this.bus.on(ProjectEvents.Clear, () => this.clear());

        this.bus.on(ApartmentEvents.Update, (projectId, apartments) => this.apartmentsChanged(projectId, apartments));
    }

    projectsChanged(projects) {
        const newIds = new Set(projects.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of projects) {
            if (!this.items.has(data.id)) {
                const item = new AdminProjectGroup({registry: this.registry, bus: this.bus});
                this.items.set(data.id, item);
                this.pushItemToFront(item.element)
            }

            this.items.get(data.id).updateProject(data);
        }
    }

    apartmentsChanged(projectId, apartments) {
        this.items.get(projectId)?.updateApartments(apartments);
    }
}