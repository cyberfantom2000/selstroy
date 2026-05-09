import { ProjectEvents, ApartmentEvents } from "../../core/events.mjs";
import { ProjectGroup } from "../../projects/group.mjs";


export class ProjectGroupContainer {
    constructor({registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.element = this.registry.get('project-group-container');
        this.items = new Map();

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
                const item = new ProjectGroup({registry: this.registry, bus: this.bus});
                this.items.set(data.id, item);
                this.element.appendChild(item.element)
            }

            this.items.get(data.id).updateProject(data);
        }
    }

    apartmentsChanged(projectId, apartments) {
        this.items.get(projectId)?.updateApartments(apartments);
    }

    clear() {
        while (this.element.firstChild)
            this.element.removeChild(this.element.firstChild);
    }
}