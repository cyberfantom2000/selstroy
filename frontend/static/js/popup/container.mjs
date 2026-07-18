import { PopupEvents } from "../core/events.mjs";
import { PopupMessage } from "./message.mjs";


export class PopupContainer {
    constructor({registry, bus}) {
        this.registry = registry;
        this.bus = bus;
        this.messages = new Map();

        this.container = this.registry.get('popup-container');

        this.bus.on(PopupEvents.Message.Show, (data) => this.addMessage(data));
        this.bus.on(PopupEvents.Message.Remove, (id) => this.removeMessage(id));
    }

    addMessage(data) {
        if (this.alreadyExists(data))
            return;

        const message = new PopupMessage({data: data, registry: this.registry});
        message.closeClicked = () => this.removeMessage(data.context.id);
        message.hover = () => {
            this.bus.emit(PopupEvents.Message.Hover, data.context);
            message.stopProgressAnimation();
        };
        message.hoverEnd = () => {
            this.bus.emit(PopupEvents.Message.HoverEnd, data.context);
            if (data.duration)
                message.startProgressAnimation(data.duration);
        };

        if (data.duration)
            message.startProgressAnimation(data.duration);
        
        this.container.append(message.element);
        this.messages.set(data.context.id, message);
    }

    removeMessage(id) {
        if (this.messages.has(id)) {
            const message = this.messages.get(id);
            message.fadeOut();
            
            setInterval(() => { 
                message.destroy(); 
                this.messages.delete(id);
            }, 300);
        }
    }

    alreadyExists(data) {
        let a = [...this.messages];
        let b = a.find(([key, value]) => { return key === data.context.id || value.isSameData(data); });
        return [...this.messages].find(([key, value]) => { return key === data.context.id || value.isSameData(data); });
    }
}