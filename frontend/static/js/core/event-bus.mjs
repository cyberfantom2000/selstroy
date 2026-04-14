export class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, handler) {
        if (!event)
            throw new Error('Invalid event');
        (this.events[event] ||= []).push(handler);
    }

    emit(event, ...payload) {
        if (!event)
            throw new Error('Invalid event');
        (this.events[event] || []).forEach(h => h(...payload));
    }
}