import { FeedbackEvents } from "../core/events.mjs";


export class FeedbackStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
    }

    async sendMessage(data) {
        try {
            await this.api.sendMessage(data);
            this.bus.emit(FeedbackEvents.Message.Success);
        } catch (err) {
            console.log(err);
            this.bus.emit(FeedbackEvents.Error, err);
        }
    }

    async sendRecall(data) {
        try {
            await this.api.sendRecall(data);
            this.bus.emit(FeedbackEvents.Recall.Success);
        } catch (err) {
            console.log(err);
            this.bus.emit(FeedbackEvents.Error, err);
        }
    }
}