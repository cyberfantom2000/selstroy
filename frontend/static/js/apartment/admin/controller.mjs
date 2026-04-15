import { Timer } from "../../common/timer.mjs";
import { ApartmentEvents, ModalEvents, PopupEvents, ModelErrorType } from "../../core/events.mjs";


export class AdminApartmentController {
    constructor({bus, store}) {
        this.bus = bus;
        this.store = store;
        this.retryTimer = new Timer({delay: 10000, singleshot: true});

        this.bus.on(ApartmentEvents.Error, (type, error) => this.onError(type, error));

        /* Apartment events */
        this.bus.on(ApartmentEvents.Request.Apartment.Create, (data) => {
            this.bus.emit(ModalEvents.Apartment.Open, {
                title: 'Создать планировку',
                data: data
            });
        });

        this.bus.on(ApartmentEvents.Request.Apartment.Edit, (data) => {
            this.bus.emit(ModalEvents.Apartment.Open, {
                title: 'Изменить планировку',
                data: data
            });
        });

        this.bus.on(ApartmentEvents.Request.Apartment.ToggleDraft, (data) => {
            this.store.updateApartment({id: data.id, isDraft: !data.isDraft});
        });

        this.bus.on(ApartmentEvents.Request.Apartment.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: ApartmentEvents.Request.Apartment.Remove,
                style: 'danger',
                text: 'Вы уверены что хотите удалить планировку?',
                data: data
            });
        });

        this.bus.on(ApartmentEvents.Request.Apartment.Preview, (data) => {
            this.bus.emit(PopupEvents.Message.Inf.Show, "Эта функция пока не реализована");
        });

        /* Apartment image events */
        this.bus.on(ApartmentEvents.Request.Image.Open, (url) => this.bus.emit(ModalEvents.Image.Open, url));

        this.bus.on(ApartmentEvents.Request.Image.Create, ({apartmentId}) => {
            this.bus.emit(ModalEvents.ApartmentImage.Open, {
                title: 'Добавить изображение',
                data: {apartmentId: apartmentId}
            });
        });

        this.bus.on(ApartmentEvents.Request.Image.Edit, (data) => {
            this.bus.emit(ModalEvents.ApartmentImage.Open, {
                title: 'Изменить изображение',
                data: data
            });
        });

        this.bus.on(ApartmentEvents.Request.Image.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: ApartmentEvents.Request.Image.Remove,
                style: 'danger',
                text: 'Вы уверены что хотите удалить изображение?',
                data: data
            });
        });

        /* Apartment floor events */
        this.bus.on(ApartmentEvents.Request.Floor.Create, (apartmentId) => {
            this.bus.emit(ModalEvents.ApartmentFloor.Open, {
                title: 'Создать кваритиру',
                data: { apartmentId: apartmentId }
            });
        });

        this.bus.on(ApartmentEvents.Request.Floor.Edit, (data) => {
            this.bus.emit(ModalEvents.ApartmentFloor.Open, {
                title: 'Изменить кваритиру',
                data: data
            });
        });

        this.bus.on(ApartmentEvents.Request.Floor.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: ApartmentEvents.Request.Floor.Remove,
                style: 'danger',
                text: 'Вы уверены что хотите удалить квартиру?',
                data: data
            });
        });

        /* Modal events */
        this.bus.on(ModalEvents.Confirm.Confirmed, (payload) => {
            if (payload.type === ApartmentEvents.Request.Image.Remove)
                this.store.removeImage(payload.data.apartmentId, payload.data.id);

            if (payload.type === ApartmentEvents.Request.Apartment.Remove)
                this.store.removeApartment(payload.data.id);

            if (payload.type === ApartmentEvents.Request.Floor.Remove)
                this.store.removeFloor(payload.data.apartmentId, payload.data.id);
        });

        this.bus.on(ModalEvents.ApartmentImage.Confirmed, (data) => {
            if (data.id)
                this.store.updateImage(data);
            else
                this.store.createImage(data);
        });

        this.bus.on(ModalEvents.Apartment.Confirmed, (data) => {
            if (data.id)
                this.store.updateApartment(data);
            else
                this.store.createApartment(data);
        });

        this.bus.on(ModalEvents.ApartmentFloor.Confirmed, (data) => {
            if (data.id)
                this.store.updateFloor(data);
            else
                this.store.createFloor(data);
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
            this.bus.emit(ApartmentEvents.Clear);
            this.load();
        });
    }
}