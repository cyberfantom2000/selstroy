import { NavigationEvents } from "../../core/events.mjs";


export class NotFoundController {
    constructor({bus}) {
        this.bus = bus;
        this.bus.on(NavigationEvents.NotFound, () => this.redirect());
    }

    redirect() {
        window.location.replace('/404');
    }
}
