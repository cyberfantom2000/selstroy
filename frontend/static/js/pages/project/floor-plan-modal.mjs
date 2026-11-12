import { Modal } from "../../modals/modal.mjs";
import { ModalEvents } from "../../core/events.mjs";
import { fitFrameContent, onFrameLoad } from "../../utils/iframe.mjs";


export class FloorPlanModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('floor-plan-modal'));
        this.bus = bus;
        this.frame = this.element.querySelector('iframe');

        fitFrameContent(this.frame);
        onFrameLoad(this.frame, (doc) => this.bindNavigation(doc));

        this.bus.on(ModalEvents.FloorPlan.Open, (url) => {
            this.frame.src = url;
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.FloorPlan.Rejected);
    }

    bindNavigation(doc) {
        doc.addEventListener('click', (event) => {
            const target = event.target.closest?.('[id^="/"]');

            if (target && target.id)
                window.location.href = target.id;
        });
    }

    hide() {
        this.frame.src = 'about:blank';
        super.hide();
    }
}
