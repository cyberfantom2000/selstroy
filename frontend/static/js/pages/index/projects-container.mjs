import { ProjectEvents } from "../../core/events.mjs";
import { ProjectPreviewItem } from "./project-preview-item.mjs";


export class ProjectsPreviewContainer {
    constructor({ registry, bus }) {
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.container = registry.get('projects-preview-container');

        this.bus.on(ProjectEvents.Update, (projects) => this.projectsChanged(projects));
        this.bus.on(ProjectEvents.Clear, () => this.clear());
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
                const item = new ProjectPreviewItem(this.registry);
                this.items.set(data.id, item);
                this.container.appendChild(item.element)
            }

            this.items.get(data.id).update(data);
        }
    }

    clear() {
        while (this.container.firstChild)
            this.container.removeChild(this.container.firstChild);
    }
}