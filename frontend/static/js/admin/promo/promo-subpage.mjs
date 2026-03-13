import { PromoItem } from "./promo-item.mjs";
import { Timer } from "../../utils/timer.mjs";

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


export class PromoSubpage {
    constructor({requests, dom, editModal, confirmModal}) {
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
        this.editModal.setData({});

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
        const item = new PromoItem({
            basePromoTemplate: this.dom.basePromoTemplate,
            adminPromoTemplate: this.dom.adminPromoTemplate,
            data: data
        });

        item.deleteClicked = (selfItem) => {
            this.confirmModal.setText({
                title: 'Подтвердите действие', 
                description: `Вы уверены, что хотите удалить элемент?`
            });
            this.confirmModal.setSubmitButtonStyle('danger');

            this.confirmModal.onConfirm = () => {
                selfItem.setButtonsEnabled(false);
                this.requests.asyncDeleter(item.data.id).then((reply) => {
                    // TODO toast message
                    selfItem.element.remove();
                }).catch((err) => {
                    console.log(err);
                    // TODO toast message
                });
            }

            this.confirmModal.show();
        };

        item.editClicked = (selfItem) => {
            this.editModal.setTitle('Изменение элемента');
            this.editModal.setData(selfItem.data);

            this.editModal.submitClicked = (data) => {
                selfItem.setButtonsEnabled(false);
                this.requests.asyncUpdater(data).then((reply) => {
                    // TODO toast message
                    selfItem.update(reply);
                }).catch((err) => {
                    // TODO toast message
                    console.log(err);
                }).finally(() => {
                    selfItem.setButtonsEnabled(true);
                });
            };

            this.editModal.show();
        };

        item.draftClicked = (selfItem) => {
            selfItem.setButtonsEnabled(false);
            this.requests.asyncSetDraftStatus(selfItem.data.id, !selfItem.data.is_draft).then((reply) => {
                // TODO toast message
                selfItem.update(reply);
            }).catch((err) => {
                // TODO toast message
                console.log(err);
            }).finally(() => {
                selfItem.setButtonsEnabled(true);
            });
        };

        return item;
    }

    pushItemToFront(item) {
        this.dom.itemsContainer.prepend(item.fragment);
    }

    show() {
        this.dom.pageContainer.classList.remove('hidden');
    }

    hide() {
        this.dom.pageContainer.classList.add('hidden');
    }

    clear() {
        while(this.dom.itemsContainer.firstChild)
            this.dom.itemsContainer.removeChild(this.dom.itemsContainer.firstChild);
    }
}