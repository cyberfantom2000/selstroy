import { ProjectItem } from "./item.mjs";
import { ApartmentsContainer } from "./apartments-container.mjs";


export class ProjectGroup {
    constructor({data, templates}) {
        this.fragment = templates.group.content.cloneNode(true);
        this.projectContainer = this.fragment.querySelector('[name="project-container"]');
        this.moreButton = this.fragment.querySelector('[name="load-more-btn"]');

        this.apartsContainer = new ApartmentsContainer({
            container: this.fragment.querySelector('[name="apartments-container"]'),
            baseTemplate: templates.apartment,
            soldOutTemplate: templates.apartmentSoldOut
        });

        this.project = new ProjectItem({
            data: data,
            baseTemplate: templates.projectItem,
            tagTemplate: templates.projectTag
        });

        this.projectContainer.appendChild(this.project.fragment);

        this.update(data);
    }

    update(data) {
        this.project.update(data);

        if (data.apartments) {
            this.apartsContainer.clear();
            this.apartsContainer.add(data.apartments);
        }
    }
}