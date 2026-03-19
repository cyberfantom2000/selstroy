import { Timer } from "../../utils/timer.mjs";
import { Page } from "../page.mjs";
import { AdminProjectItem } from "./project-item.mjs";


export class ProjectsRequests {
    constructor({asyncLoader, asyncDeleter, asyncSetDraftStatus, asyncUpdater, asyncCreator}) {
        this.asyncLoader = asyncLoader;
        this.asyncDeleter = asyncDeleter;
        this.asyncSetDraftStatus = asyncSetDraftStatus;
        this.asyncUpdater = asyncUpdater;
        this.asyncCreator = asyncCreator; 
    }
}

export class ProjectsDom {
    constructor({pageContainer, itemsContainer, createButton, adminTemplate, baseTemplates}) {
        this.pageContainer = pageContainer;
        this.itemsContainer = itemsContainer;
        this.createButton = createButton;
        this.adminTemplate = adminTemplate;
        this.baseTemplates = baseTemplates;
    }
}


export class ProjectsSubpage extends Page {
    constructor({requests, dom, editModal, confirmModal}) {
        super({pageContainer: dom.pageContainer, itemsContainer: dom.itemsContainer});
        this.requests = requests;
        this.dom = dom;
        this.editModal = editModal;
        this.confirmModal = confirmModal;

        this.timer = new Timer(10000, true);

        this.dom.createButton.onclick = () => this.onCreateClicked();

        this.load();
    }

    async load() {
        try {
            const items = await this.requests.asyncLoader();
            for (const data of items) {
                const item = this.buildItem(data);
                this.pushItemToFront(item);
            }
        } catch (err) {
            // TODO toast message
            console.log(err);
            this.timer.start(() => {
                this.timer.stop();
                this.clear();
                this.load();
            });
        }
    }

    buildItem(data) {
        const item = new AdminProjectItem({
            data: data,
            adminTemplate: this.dom.adminTemplate,
            baseTemplates: this.dom.baseTemplates
        });

        item.previewClicked = () => {
            // TODO
        };

        item.editClicked = (data) => {
            this.editModal.setTitle('Изменение элемента');
            this.editModal.setData(data);

            this.editModal.submitClicked = (newData) => {
                item.setButtonsEnabled(false);
                this.requests.asyncUpdater(newData).then((reply) => {
                    // TODO toast message
                    item.update(reply);
                }).catch((err) => {
                    // TODO toast message
                    console.log(err);
                }).finally(() => {
                    item.setButtonsEnabled(true);
                });
            };

            this.editModal.show();
        }

        item.draftClicked = (data) => {
            item.setButtonsEnabled(false);
            this.requests.asyncSetDraftStatus(data.id, !data.is_draft).then((reply) => {
                // TODO toast message
                item.update(reply);
            }).catch((err) => {
                // TODO toast message
                console.log(err);
            }).finally(() => {
                item.setButtonsEnabled(true);
            });
        };

        item.deleteClicked = (data) => {
            this.confirmModal.setText({
                title: 'Подтвердите действие', 
                description: `Вы уверены, что хотите удалить элемент?`
            });
            this.confirmModal.setSubmitButtonStyle('danger');

            this.confirmModal.onConfirm = () => {
                item.setButtonsEnabled(false);
                this.requests.asyncDeleter(data.id).then((reply) => {
                    // TODO toast message
                    item.element.remove();
                }).catch((err) => {
                    console.log(err);
                    // TODO toast message
                });
            }

            this.confirmModal.show();
        };

        return item;
    }

    onCreateClicked() {
        this.editModal.setTitle('Создание нового объекта')
        this.editModal.clearData();

        this.editModal.submitClicked  = (data) => {
            this.requests.asyncCreator(data).then((reply) => {
                const item = this.buildItem(reply);
                this.pushItemToFront(item);
                // TODO toast message
            }).catch((err) => {
                // TODO toast message
                console.log(err);
            });
        };

        this.editModal.show();
    }
}