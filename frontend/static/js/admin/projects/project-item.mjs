import { ProjectItem } from "../../projects/project-item.mjs";


export class AdminProjectItem {
    constructor({data, baseTemplates, adminTemplate}) {
        this.data = data;
        this.baseItem = new ProjectItem({ data: data, templates: baseTemplates });
        this.baseItem.setAppartmentsVisible(false);

        this.fragment = adminTemplate.content.cloneNode(true);
        this.element =  this.fragment.firstElementChild;

        this.container = this.fragment.querySelector('[name="item-container"]');
        this.previewButton = this.fragment.querySelector('[name="preview-button"]');
        this.editButton = this.fragment.querySelector('[name="edit-button"]');
        this.draftButton = this.fragment.querySelector('[name="draft-button"]');
        this.deleteButton = this.fragment.querySelector('[name="delete-button"]');

        this.previewClicked = null;
        this.editClicked = null;
        this.draftClicked = null;
        this.deleteClicked = null;

        this.previewButton.onclick = () => { if (this.previewClicked) this.previewClicked(); }
        this.editButton.onclick = () => { if (this.editClicked) this.editClicked(this.data); }
        this.draftButton.onclick = () => { if (this.draftClicked) this.draftClicked(this.data); }
        this.deleteButton.onclick = () => { if (this.deleteClicked) this.deleteClicked(this.data); }

        this.container.appendChild(this.baseItem.fragment);
    }

    update(data) {
        this.data = data;
        this.baseItem.update(data);
        this.setDraftButtonSelect(data.is_draft);
    }

    setButtonsEnabled(enabled) {
        this.previewButton.enabled = enabled;
        this.editButton.enabled = enabled;
        this.draftButton.enabled = enabled;
        this.deleteButton.enabled = enabled;
    }

    setDraftButtonSelect(select) {
        if (select) {
            this.draftButton.title = 'Опубликовать'
            this.draftButton.classList.add('text-primary-500', 'dark:text-primary-500');
        } else {
            this.draftButton.title = 'Сделать черновиком'
            this.draftButton.classList.remove('text-primary-500', 'dark:text-primary-500');
        }
    }
}