import { Timer } from "../../utils/timer.mjs";
import { GalleryEvents, ModalEvents, PopupEvents, ModelErrorType } from "../../core/events.mjs";


export class AdminGalleryController {
    constructor({bus, store}) {
        this.bus = bus;
        this.store = store;
        this.retryTimer = new Timer({delay: 10000, singleshot: true});

        this.bus.on(GalleryEvents.Error, (type, error) => this.onError(type, error));

        this.bus.on(GalleryEvents.Request.Open, (url) => this.bus.emit(ModalEvents.ImageView.Open, url));

        this.bus.on(GalleryEvents.Request.Create, () => {
            this.bus.emit(ModalEvents.GalleryItem.Open, {
                title: 'Добавить элемент',
                data: {}
            });
        })

        this.bus.on(GalleryEvents.Request.Edit, (data) => {
            this.bus.emit(ModalEvents.GalleryItem.Open,  {
                title: 'Редактировать элемент',
                data: data
            });
        });

        this.bus.on(GalleryEvents.Request.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: GalleryEvents.Request.Remove,
                style: 'danger',
                text: 'Вы уверены что хотите удалить элемент?',
                data: data
            });
        });

        this.bus.on(ModalEvents.Confirm.Confirmed, (payload) => {
            if (payload.type === GalleryEvents.Request.Remove)
                this.store.removeItem(payload.data.id);
        });

        this.bus.on(ModalEvents.GalleryItem.Confirmed, (data) => {
            if (data.id)
                this.store.updateItem(data);
            else
                this.store.createItem(data);
        });
    }

    async load() {
        await this.store.load();
    }

    onError(type, error) {
        if (type === ModelErrorType.Load)
            this.retryLoad();

        this.bus.emit(PopupEvents.Message.Err.Show, error);
    }

    retryLoad() {
        this.retryTimer.start(() => {
            this.bus.emit(GalleryEvents.Clear);
            this.load();
        });
    }
}