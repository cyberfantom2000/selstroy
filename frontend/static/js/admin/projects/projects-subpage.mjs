import { Timer } from "../../utils/timer.mjs";
import { ProjectsPreview } from "./project-preview.mjs";



export class ProjectsRequests {
    constructor({asyncLoader, asyncDeleter, asyncSetDraftStatus, asyncEditor, asyncCreator}) {
        this.asyncLoader = asyncLoader;
        this.asyncDeleter = asyncDeleter;
        this.asyncSetDraftStatus = asyncSetDraftStatus;
        this.asyncEditor = asyncEditor;
        this.asyncCreator = asyncCreator; 
    }
}


export class ProjectsSubpage {
    constructor({requests, editModal, confirmModal, createButton, itemsContainer, elementTemplate}) {
        this.requests = requests;
        this.editModal = editModal;
        this.createButton = createButton;

        this.preview = new ProjectsPreview({
            container: itemsContainer,
            elementTemplate: elementTemplate,
            confirmModal: confirmModal,
            editModal: editModal
        });

        this.preview.onEditClicked = (data) => { 
            this.preview.setItemButtonsEnabled(data.id, false);
            this.requests.asyncEditor(data).then((reply) => {
                // TODO toast message
                this.preview.updateItem(reply);
            }).catch((err) => {
                // TODO toast message
            }).finally(() => {
                // TODO toast message
                this.preview.setItemButtonsEnabled(data.id, true);
            });
        };

        this.preview.onSetDraftClicked = (id, isDraft) => {
            this.preview.setItemButtonsEnabled(id, false);
            this.requests.asyncSetDraftStatus(id, isDraft).then((reply) => {
                // TODO toast message
                this.preview.updateItem(reply);
            }).catch((err) => {
                // TODO toast message
            }).finally(() => {
                // TODO toast message
                this.preview.setItemButtonsEnabled(id, true);
            });
        };

        this.preview.onDeleteClicked = (id) => {
            this.preview.setItemButtonsEnabled(id, false);
            this.requests.asyncDeleter(id).then((reply) => {
                // TODO toast message
                this.preview.deleteItem(id);
            }).catch((err) => {
                // TODO toast message
                this.preview.setItemButtonsEnabled(id, false);
            });
        };
        

        this.createButton.onclick = () => {
            this.editModal.clearData();
            this.editModal.setTitle('Создание нового проекта');
            this.editModal.onSubmit = (data) => {
                this.requests.asyncCreate(data).then((reply) => {
                    // TODO toast message
                    this.preview.build([reply]);
                }).catch((err) => {
                    // TODO toast message
                });
            };

            this.editModal.show();
        };

        this.retryTimer = new Timer(10000);

        this.loadItems();
    }

    async loadItems() {
        try {
            const items = await this.requests.asyncLoader();
            this.preview.build(items);
        } catch (err) {
            // TODO toast message
            this.retryTimer.start(() => {
                this.retryTimer.stop();
                this.preview.clear();
                this.loadItems();
            });
        }
    }
    
}