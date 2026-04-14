import { Timer } from "../common/timer.mjs";
import { PopupEvents } from "../core/events.mjs";


const defaultTimeout = 10000;

const MessageType = {
    Info: 'info',
    Warning: 'warning',
    Error: 'error'
};


export class PopupController {
    constructor(bus) {
        this.bus = bus;
        this.timers = new Map();

        this.bus.on(PopupEvents.Message.Inf.Show, (text) => {
            const id = crypto.randomUUID();
            const context = {id: id, type: MessageType.Info};
            this.bus.emit(PopupEvents.Message.Show, {title: 'Инфо', text: text, style: 'info', context: context, duration: defaultTimeout});
            this.addDestroyTimer(defaultTimeout, id);
        });

        this.bus.on(PopupEvents.Message.Wrn.Show, (text) => {
            const id = crypto.randomUUID();
            const context = {id: id, type: MessageType.Warning};
            this.bus.emit(PopupEvents.Message.Show, {title: 'Предупреждение', text: text, style: 'warning', context: context, duration: defaultTimeout});
            this.addDestroyTimer(defaultTimeout, id);
        });

        this.bus.on(PopupEvents.Message.Err.Show, (text) => {
            const id = crypto.randomUUID();
            const context = {id: id, type: MessageType.Error};
            this.bus.emit(PopupEvents.Message.Show, {title: 'Ошибка', text: text, style: 'danger', context: context});
        });

        this.bus.on(PopupEvents.Message.Hover, (context) => this.removeDestroyTimer(context.id));
        this.bus.on(PopupEvents.Message.HoverEnd, (context) => {
            if (context.type !== MessageType.Error)
                this.addDestroyTimer(defaultTimeout, context.id);
        });
    }

    addDestroyTimer(timeout, messageId) {
        const timer = new Timer({delay: timeout, singleshot: true});
        this.timers.set(messageId, timer);

        timer.start(() => {
            this.bus.emit(PopupEvents.Message.Remove, messageId);
        });
    }

    removeDestroyTimer(messageId) {
        if (this.timers.has(messageId)) {
            this.timers.get(messageId).stop();
            this.timers.delete(messageId);
        }
    }
};