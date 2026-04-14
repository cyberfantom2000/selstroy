import { TagsContainer } from "./tags-container.mjs";


export class ProjectItem {
    constructor(registry) {
        this.element = registry.getTemplate('project-item-template');
        this.title = this.element.querySelector('[name="title"]');
        this.image = this.element.querySelector('img');

        this.tagsContainer = new TagsContainer({
            container: this.element.querySelector('[name="tags-container"]'),
            registry: registry
        });

        this.image.classList.add('object-cover');
    }

    update(data) {
        this.title.textContent = data.title ?? 'unknown';
        this.image.src = data.previewImage ? data.previewImage.url : '';
        this.element.href = data.pageRef ?? '#';

        if (data.tags) {
            const tags = data.tags.split(',');
            this.tagsContainer.clear();
            this.tagsContainer.add(tags);
        }
    }
}