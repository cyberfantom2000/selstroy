import { Modal } from "../../modals/modal.mjs";
import { ModalEvents } from "../../core/events.mjs";
import { fitFrameContent, onFrameLoad } from "../../utils/iframe.mjs";
import { resolveFloorPlanUrl, selectFloorPlanApartment } from "../../utils/floor-plan.mjs";


export class FloorPlanModal extends Modal {
    constructor({registry, bus}) {
        super(registry.get('floor-plan-modal'));
        this.bus = bus;
        this.frame = this.element.querySelector('iframe');
        this.apartmentUrl = null;

        fitFrameContent(this.frame);
        onFrameLoad(this.frame, (doc) => {
            doc.addEventListener('keydown', this.escapeHandler);
            this.bindNavigation(doc);
            if (this.apartmentUrl)
                selectFloorPlanApartment(doc, this.apartmentUrl);
        });

        this.bus.on(ModalEvents.FloorPlan.Open, (url, apartmentUrl = null) => {
            this.apartmentUrl = apartmentUrl;
            this.frame.src = url;
            this.show();
        });

        this.rejectClicked = () => this.bus.emit(ModalEvents.FloorPlan.Rejected);
    }

    bindNavigation(doc) {
        doc.addEventListener('click', (event) => {
            const target = event.target.closest?.('[id^="/"], [id^="apartments/"]');

            if (target && target.id) {
                event.preventDefault();
                window.location.href = resolveFloorPlanUrl(target.id, window.location.origin);
            }
        });
    }

    hide() {
        this.frame.src = 'about:blank';
        this.apartmentUrl = null;
        super.hide();
    }
}
