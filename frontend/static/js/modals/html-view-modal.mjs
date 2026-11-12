import { Modal } from "./modal.mjs";
import { ModalEvents } from "../core/events.mjs";


export class HtmlViewModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('html-view-modal'));
        this.bus = bus;
        this.preview = this.element.querySelector('iframe');

        this.bus.on(ModalEvents.HtmlView.Open, (url) => {
            this.update(url);
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.HtmlView.Rejected);
    }

    update(url) {
        this.preview.src = url ?? 'about:blank';
    }

    hide() {
        this.update(null);
        super.hide();
    }
}
