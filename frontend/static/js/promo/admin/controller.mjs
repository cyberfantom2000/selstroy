import { Timer } from "../../utils/timer.mjs";
import { PromoEvents, ModalEvents, PopupEvents, ModelErrorType } from "../../core/events.mjs";


export class AdminPromoController {
    constructor({bus, store}) {
        this.bus = bus;
        this.store = store;
        this.retryTimer = new Timer({delay: 10000, singleshot: true});

        this.bus.on(PromoEvents.Error, (type, error) => this.onError(type, error));

        this.bus.on(PromoEvents.Request.Create, () => {
            this.bus.emit(ModalEvents.Promo.Open, {
                title: 'Создать акцию',
                data: {}
            });
        })

        this.bus.on(PromoEvents.Request.Edit, (data) => {
            this.bus.emit(ModalEvents.Promo.Open,  {
                title: 'Редактировать акцию',
                data: data
            });
        });

        this.bus.on(PromoEvents.Request.ToggleDraft, (data) => {
            this.store.update({id: data.id, isDraft: !data.isDraft});
        });

        this.bus.on(PromoEvents.Request.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: PromoEvents.Request.Remove,
                style: 'danger',
                text: 'Вы уверены что хотите удалить акцию?',
                data: data
            });
        });

        this.bus.on(ModalEvents.Confirm.Confirmed, (payload) => {
            if (payload.type === PromoEvents.Request.Remove)
                this.store.remove(payload.data.id);
        });

        this.bus.on(ModalEvents.Promo.Confirmed, (data) => {
            if (data.id)
                this.store.update(data);
            else
                this.store.create(data);
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
            this.bus.emit(PromoEvents.Clear);
            this.load();
        });
    }
}