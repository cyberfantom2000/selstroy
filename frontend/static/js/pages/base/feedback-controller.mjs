import { FeedbackEvents, PopupEvents, ModalEvents } from "../../core/events.mjs";


export class FeedbackController {
    constructor({controller, bus}) {
        this.controller = controller;
        this.bus = bus;

        this.bus.on(ModalEvents.SideLeft.Confirmed, (data) => {
            this.controller.sendRecall(data);
        });

        this.bus.on(ModalEvents.SideRight.Confirmed, (data) => {
            this.controller.sendMessage(data);
        });

        this.bus.on(FeedbackEvents.Message.Success, () => {
            this.bus.emit(PopupEvents.Message.Inf.Show, 'Обращение зарегестрировано! Ответ поступит на почту, указанную при обращении.');
            this.bus.emit(ModalEvents.SideRight.Clear);
        });

        this.bus.on(FeedbackEvents.Recall.Success, () => {
            this.bus.emit(PopupEvents.Message.Inf.Show, 'Обращение зарегестрировано! Наши менеджеры свяжутся с Вами в ближайшее время.');
        });

        this.bus.on(FeedbackEvents.Error, (err) => {
            this.bus.emit(PopupEvents.Message.Err.Show, 'Ой! Это ошибка. Мы уже ее чиним, попробуйте позже.');
        });
    }
}