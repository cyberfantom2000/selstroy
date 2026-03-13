import { MediaItem } from "./media-item.mjs";
import { Timer } from "../../utils/timer.mjs";


export class MediaSubpageDom {
    constructor({pageContainer, itemsContainer, itemTemplate}){
        this.pageContainer = pageContainer;
        this.itemsContainer = itemsContainer;
        this.itemTemplate = itemTemplate;
    }
}

export class MediaRequests {
    constructor({asyncLoader, asyncUploader, asyncDeleter, asyncFileDownloader}) {
        this.asyncLoader = asyncLoader;
        this.asyncUploader = asyncUploader;
        this.asyncDeleter = asyncDeleter;
        this.asyncFileDownloader = asyncFileDownloader;
    }
}

export class MediaSubpage {
    constructor({requests, dom, infoModal, confirmModal, dnd, chooseFiles}){
        this.requests = requests;
        this.dom = dom;
        this.dnd = dnd;
        this.infoModal = infoModal;
        this.confirmModal = confirmModal;
        this.chooseFiles = chooseFiles;
        this.retryTimer = new Timer(10000);
        
        this.chooseFiles.chooseChanged = (files) => this.uploadFiles(files);
        this.dnd.filesDropped = (files) => this.uploadFiles(files);

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

    uploadFiles(files) {
        for (const file of files) {
            const item = this.buildItem({name: 'uploading'});
            this.pushItemToFront(item);
            item.setButtonsEnabled(false);

            this.requests.asyncUploader(file).then((reply) => {
                item.update(reply);
                item.setButtonsEnabled(true);
            }).catch((err) => {
                console.log(err);
                // TODO toast message
                item.element.remove();
            });
        }
    }

    buildItem(data) {
        const item =  new MediaItem({
            template: this.dom.itemTemplate,
            data: data
        });

        item.deleteClicked = (selfItem) => {
            this.confirmModal.setText({
                title: 'Подтвердите действие', 
                description: `Вы уверены, что хотите удалить файл "${selfItem.title.textContent}"?`
            });
            this.confirmModal.setSubmitButtonStyle('danger');

            this.confirmModal.onConfirm = () => {
                selfItem.setButtonsEnabled(false);
                if (selfItem.loaded) {
                    this.requests.asyncDeleter(item.data.id).then((reply) => {
                        // TODO toast message
                        this.removeItem(selfItem);
                    }).catch((err) => {
                        console.log(err);
                        // TODO toast message
                    });
                } else {
                    this.removeItem(selfItem);
                }
            }

            this.confirmModal.show();
        };

        item.copyClicked = () => {
            navigator.clipboard.writeText(item.data.id).then(() => {
                // TODO toast message
            }).catch((err) => {
                // TODO toast message
            });
        };

        item.linkClicked = () => {
            navigator.clipboard.writeText(item.absoluteLink).then(() => {
                // TODO toast message
            }).catch((err) => {
                // TODO toast message
            });
        };

        item.downloadClicked = () => {
            this.requests.asyncFileDownloader(item.absoluteLink, item.title.textContent).then(() => {
                // TODO toast message
            }).catch((err) => {
                // TODO toast message
            });
        };

        item.clicked = () => {
            this.infoModal.show(item);
        };

        return item;
    }

    pushItemToFront(item) {
        this.dom.itemsContainer.prepend(item.fragment);
    }

    removeItem(item) {
        item.element.remove();
    }

    show() {
        this.dom.pageContainer.classList.remove('hidden');
    }

    hide() {
        this.dom.pageContainer.classList.add('hidden');
    }

    clear() {
        while(this.dom.pageContainer.firstChild)
            this.dom.pageContainer.removeChild(this.dom.pageContainer.firstChild);
    }
}