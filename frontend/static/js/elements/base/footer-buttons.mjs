import { ModalEvents } from "../../core/events.mjs";


export class FooterButtons {
    constructor({registry, bus}) {
        this.bus = bus;
        this.leftButton = registry.get('left-footer-button');
        this.rightButton = registry.get('right-footer-button');

        this.leftButton.onclick = () => this.bus.emit(ModalEvents.SideLeft.Open);
        this.rightButton.onclick = () => this.bus.emit(ModalEvents.SideRight.Open);
    }
}