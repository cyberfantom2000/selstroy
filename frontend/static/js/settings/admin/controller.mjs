import { SiteSettingsEvents, ModalEvents, PopupEvents } from "../../core/events.mjs";


export class AdminSettingsController {
    constructor({bus, store}) {
        this.bus = bus;
        this.store = store;
        this.busy = false;

        this.bus.on(SiteSettingsEvents.Error, (type, error) => this.onError(error));
        this.bus.on(SiteSettingsEvents.Request.SaveStatistics, data => {
            if (!this.store.current()) return;

            this.run('statistics', () => this.store.update(data));
        });
        this.bus.on(SiteSettingsEvents.Request.EditImage, () => this.editImage());
        this.bus.on(SiteSettingsEvents.Request.RemoveImage, () => this.removeImage());

        this.bus.on(ModalEvents.EditableFile.Confirmed, ({context, data}) => {
            if (context?.type !== SiteSettingsEvents.Request.EditImage) return;

            this.run('image', () => this.store.update({heroImage: data}));
        });
        this.bus.on(ModalEvents.Confirm.Confirmed, payload => {
            if (payload.type !== SiteSettingsEvents.Request.RemoveImage) return;

            this.run('image', () => this.store.update({heroImage: null}));
        });
    }

    async load() {
        return await this.run('load', () => this.store.load());
    }

    editImage() {
        if (this.busy || !this.store.current()) return;

        this.bus.emit(ModalEvents.EditableFile.Open, {
            title: 'Главное изображение',
            context: {type: SiteSettingsEvents.Request.EditImage},
            data: this.store.current().heroImage,
        });
    }

    removeImage() {
        if (this.busy || !this.store.current()?.heroImage) return;

        this.bus.emit(ModalEvents.Confirm.Open, {
            type: SiteSettingsEvents.Request.RemoveImage,
            style: 'danger',
            text: 'Снять главное изображение? Файл останется в медиатеке.',
        });
    }

    async run(operation, action) {
        if (this.busy) return null;

        this.busy = true;
        this.bus.emit(SiteSettingsEvents.State, {
            busy: true, operation,
        });

        let result = null;
        try {
            result = await action();
        } catch (err) {
            this.onError(err.toString());
        } finally {
            this.busy = false;
            this.bus.emit(SiteSettingsEvents.State, {
                busy: false,
                operation: null,
            });
        }

        if (result && operation !== 'load')
            this.bus.emit(PopupEvents.Message.Inf.Show, 'Изменения сохранены');

        return result;
    }

    onError(error) {
        this.bus.emit(PopupEvents.Message.Err.Show, error);
    }
}
