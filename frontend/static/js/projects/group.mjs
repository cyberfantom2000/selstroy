import { ProjectItem } from "./item.mjs";
import { ApartmentsContainer } from "./apartments-container.mjs";


export class ProjectGroup {
    constructor({registry, bus}) {
        this.element = registry.getTemplate('project-group-template');
        this.moreButton = this.element.querySelector('[name="more-button"]');
        this.apartments = null;

        this.project = new ProjectItem(registry);
        this.apartsContainer = new ApartmentsContainer({ 
            container: this.element.querySelector('[name="apartments-container"]'),
            registry: registry 
        });
        
        this.element.querySelector('[name="project-container"]').appendChild(this.project.element);

        this.moreButton.onclick = () => this.showMoreAppartments();
    }

    updateProject(data) {
        this.project.update(data);
    }

    updateApartments(apartments) {
        apartments.sort((a, b) => {
            const aEmpty = a.floors.length === 0;
            const bEmpty = b.floors.length === 0;

            return aEmpty - bEmpty;
        });

        this.apartments = apartments;

        const showAllItems = apartments.length < 4;

        this.setMoreButtonVisible(!showAllItems);

        if (showAllItems)
            this.showApartments(apartments);
        else
            this.showApartments(apartments.slice(0, 3));
    }

    showApartments(apartments) {
        this.apartsContainer.update(apartments);
    }

    showMoreAppartments() {
        this.setMoreButtonVisible(false);
        this.showApartments(this.apartments);
    }

    setMoreButtonVisible(visible) {
        this.moreButton.classList.toggle('hidden', !visible);
    }
}