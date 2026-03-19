import { Timer } from "../../common/timer.mjs";
import { Page } from "../page.mjs";
import { AdminPromoItem } from "./promo-item.mjs"


export class PromoRequests {
    constructor({asyncLoader, asyncCreator, asyncUpdater, asyncDeleter, asyncSetDraftStatus}) {
        this.asyncLoader = asyncLoader;
        this.asyncCreator = asyncCreator;
        this.asyncUpdater = asyncUpdater;
        this.asyncDeleter = asyncDeleter;
        this.asyncSetDraftStatus = asyncSetDraftStatus;
    }
}


export class PromoSubageDom {
    constructor({pageContainer, itemsContainer, createButton, basePromoTemplate, adminPromoTemplate}) {
        this.pageContainer = pageContainer;
        this.itemsContainer = itemsContainer;
        this.createButton = createButton;
        this.basePromoTemplate = basePromoTemplate;
        this.adminPromoTemplate = adminPromoTemplate;
    }
}


export class PromoSubpage extends Page {
    constructor({requests, dom, editModal, confirmModal}) {
        super({ pageContainer: dom.pageContainer, itemsContainer: dom.itemsContainer });
        this.requests = requests;
        this.dom = dom;
        this.editModal = editModal;
        this.confirmModal = confirmModal;
        this.retryTimer = new Timer(10000);

        this.dom.createButton.onclick = () => this.onCreate();

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
            console.log(err);
            // TODO toast message
            this.retryTimer.start(() => {
                this.retryTimer.stop();
                this.clear();
                this.load();
            });
        }
    }

    onCreate() {
        this.editModal.setTitle('Создание новой акции')
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

    buildItem(data) {
        const item = new AdminPromoItem({
            data: data,
            baseTemplate: this.dom.basePromoTemplate,
            adminTemplate: this.dom.adminPromoTemplate
        });

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

        item.editClicked = (data) => {
            this.editModal.setTitle('Изменение элемента');
            this.editModal.setData(data);

            this.editModal.submitClicked = (data) => {
                item.setButtonsEnabled(false);
                this.requests.asyncUpdater(data).then((reply) => {
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
        };

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

        return item;
    }
}