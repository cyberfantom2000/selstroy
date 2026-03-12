import { mediaUrl } from "../../api/base-urls.mjs";

class ProjectItemTitle {
    constructor(data, element) {
        this.title = element.querySelector('[name="title"]');
        this.id = element.querySelector('[name="id"]');

        this.update(data);
    }

    update(data) {
        this.title.text = data.title;
        this.id.text = `ID: ${data.id}`;
    }
}


class ProjectItemImage {
    constructor(data, element) {
        this.image = element.querySelector('img');
        this.update(data);
    }

    update(data) {
        this.image.src = `${mediaUrl}/${data.preview_image.id}`;
    }
}


class ProjectItemButtons {
    constructor(data, element) {
        this.editButton = element.querySelector('[name="edit-button"]');
        this.publishButton = element.querySelector('[name="view-button"]');
        this.draftCheckbox = this.view_button.querySelector('input[type="checkbox"]');
        this.deleteButton = element.querySelector('[name="delete-button"]');

        this.update(data);
    }

    setViewButtonChecked(checked) {
        this.draftCheckbox.checked = checked;
        if (checked)
            this.publishButton.tooltip = 'Опубликовать';
        else
            this.publishButton.tooltip = 'Снять с публикации';
    }

    setEnabled(enabled) {
        this.editButton.disabled = !enabled;
        this.publishButton.disabled = !enabled;
        this.deleteButton.disabled = !enabled;
    }

    update(data) {
        this.setViewButtonChecked(data.is_published);
    }
}


class ProjectItem {
    constructor(data, template) {
        this.element = template.content.cloneNode(true);
        this.data = data;

        this.title = new ProjectItemTitle(data, this.element);
        this.image = new ProjectItemImage(data, this.element);
        this.buttons = new ProjectItemButtons(data, this.element);

        this.onEditClick = null;
        this.onPublishClick = null;
        this.onDeleteClick = null;

        this.buttons.editButton.onclick = () => { if (this.onEditClick !== null) this.onEditClick(this.data); };
        this.buttons.publishButton.onclick = () => { if (this.onPublishClick !== null) this.onPublishClick(this.data); };
        this.buttons.deleteButton.onclick = () => { if (this.onDeleteClick !== null) this.onDeleteClick(this.data); };
    }

    update(data) {
        this.data = data;
        this.title.update(data);
        this.image.update(data);
        this.buttons.update(data);
    }
}


export class ProjectsPreview {
    constructor({container, elementTemplate, confirmModal, editModal}) {
        this.mainContainer = container;
        this.elementTemplate = elementTemplate;
        this.confirmModal = confirmModal;
        this.editModal = editModal;
        this.items = {};

        this.onUpdateClicked = null;
        this.onSetDraftClicked = null;
        this.onDeleteClicked = null;
    }

    build(items) {
        for (const item of items) {
            const projectItem = this.buildItem(item);
            this.mainContainer.appendChild(projectItem.element);
            this.items[item.id] = projectItem;
        }
    }

    buildItem(item) {
        const projectItem = new ProjectItem(item, this.template);
        projectItem.onEditClick = (data) => this.itemEditClicked(data);
        projectItem.onPublishClick = (data) => this.itemSetDraftClicked(data);
        projectItem.onDeleteClick = (data) => this.itemDeleteClicked(data);
        return projectItem;
    }

    clear() {
        while(this.mainContainer.firstChild)
            this.mainContainer.removeChild(this.mainContainer.firstChild);

        this.items = {};
    }

    setItemButtonsEnabled(id, enabled) {
        this.items[id].buttons.setEnabled(enabled);
    }

    updateItem(data) {
        this.items[data.id].update(data);
    }

    deleteItem(id) {
        ;
    }

    itemEditClicked(data) {
        this.editModal.setTitle(`Редактирование проекта "${data.title}", ID: ${data.id}`);
        this.editModal.setData(data);
        this.editModal.onSubmit = (editedData) => {
            if (this.onUpdateClicked)
                this.onUpdateClicked(editedData);
        };

        this.editModal.show();
    }

    itemSetDraftClicked(data) {
        if (this.onSetDraftClicked)
            this.onSetDraftClicked(data.id, this.items[data.id].buttons.draftCheckbox.checked);
    }

    itemDeleteClicked(data) {
        this.confirmModal.setText({
            title: 'Подтвердите действие', 
            description: `Вы уверены, что хотите удалить проект "${data.title}", ID: ${data.id}?`
        });
        this.confirmModal.setSubmitButtonStyle('danger');

        if (this.onDeleteClicked)
            this.onDeleteClicked(data.id);

        this.confirmModal.show();
    }
}
