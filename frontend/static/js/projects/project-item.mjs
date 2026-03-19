import { mediaUrl } from "../api/base-urls.mjs";
import { TagsContainer } from "./tags-container.mjs";
import { ApartmentsContainer } from "./apartments-container.mjs";


export class ProjectItemTemplates {
    constructor({projectTemplate, tagTemplate, apartTemplate, soldOutTemplate}) {
        this.projectTemplate = projectTemplate;
        this.tagTemplate = tagTemplate;
        this.apartTemplate = apartTemplate;
        this.soldOutTemplate = soldOutTemplate;
    }
}


export class ProjectItem {
    constructor({data, templates}) {
        this.fragment = templates.projectTemplate.content.cloneNode(true);
        this.title = this.fragment.querySelector('[name="title"]');
        this.href = this.fragment.querySelector('[name="page-ref"]'); // TODO
        this.image = this.fragment.querySelector('img');
        this.moreButton = this.fragment.querySelector('[name="load-more-btn"]');

        this.apartsContainer = new ApartmentsContainer({
            container: this.fragment.querySelector('[name="apartments-container"]'),
            apartTemplate: templates.apartTemplate,
            soldOutTemplate: templates.soldOutTemplate
        }); 

        this.tagsContainer = new TagsContainer({
            container: this.fragment.querySelector('[name="tags-container"]'),
            template: templates.tagTemplate
        });

        this.image.classList.add('object-cover');

        this.update(data);
    }

    update(data) {
        this.data = data;

        this.title.textContent = data.title ?? 'unknown';
        this.image.src = data.preview_image ? `${mediaUrl}/${data.preview_image.id}` : '';

        if (data.tags) {
            const tags = data.tags.split(',');
            this.tagsContainer.clear();
            this.tagsContainer.add(tags);
        }

        if (data.apartments) {
            this.apartsContainer.clear();
            this.apartsContainer.add(data.apartments);
        }
    }

    setAppartmentsVisible(visible) {
        this.apartsContainer.setVisible(visible);

        if (visible)
            this.moreButton.classList.remove('hidden');
        else
            this.moreButton.classList.add('hidden');
    }
}