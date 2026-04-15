import { MediaEvents, ModalEvents, PopupEvents, ModelErrorType } from "../../core/events.mjs";
import { Timer } from "../../common/timer.mjs";


export class AdminMediaController {
    constructor({bus, store}) {
        this.bus = bus;
        this.store = store;
        this.retryTimer = new Timer({delay: 10000, singleshot: true});

        this.bus.on(MediaEvents.Error, (type, err) => this.onError(type, err));

        this.bus.on(MediaEvents.Request.Open, (data) => {
            this.bus.emit(ModalEvents.Media.Open, data);
        });
        
        this.bus.on(MediaEvents.Request.CopyId, (data) => {
            navigator.clipboard.writeText(data.id).then(() => {
                this.bus.emit(PopupEvents.Message.Inf.Show, 'ID элемента скопирован в буфер обмена');
            }).catch((err) => {
                this.bus.emit(PopupEvents.Message.Err.Show, err);
            });
        });
        
        this.bus.on(MediaEvents.Request.CopyLink, (data) => {
            navigator.clipboard.writeText(data.absoluteUrl).then(() => {
                this.bus.emit(PopupEvents.Message.Inf.Show, 'Ссылка на элемент скопирована в буфер обмена');
            }).catch((err) => {
                this.bus.emit(PopupEvents.Message.Err.Show, err);
            });
        });

        this.bus.on(MediaEvents.Request.Upload, (files) => {
            for(const file of files)
                this.store.upload(file);
        })
        
        this.bus.on(MediaEvents.Request.Download, (data) => {
            this.store.download(data.absoluteUrl, data.fullName);
        });
        
        this.bus.on(MediaEvents.Request.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: MediaEvents.Request.Remove,
                style: 'danger',
                text: `Вы уверены что хотите удалить ${data.fullName}?`,
                data: data
            });
        });
        this.bus.on(ModalEvents.Confirm.Confirmed, (payload) => {
            if (payload.type === MediaEvents.Request.Remove)
                this.store.remove(payload.data.id);
        });
    }

    async load() {
        await this.store.load();
    }

    onError(type, error) {
        if (type === ModelErrorType.Load)
            this.retryLoad();

        this.bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(error);
    }

    retryLoad() {
        this.retryTimer.start(() => {
            this.bus.emit(MediaEvents.Clear);
            this.load();
        });
    }
}