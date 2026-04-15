import { SubpageEvents } from "../core/events.mjs";


const pageKey = 'admin-active-page-id';


export class SubpageController {
    constructor(bus) {
        bus.on(SubpageEvents.Request.Update, (pageId) => {
            sessionStorage.setItem(pageKey, pageId);
            bus.emit(SubpageEvents.Request.Load, pageId);
        });

        bus.emit(SubpageEvents.Update, sessionStorage.getItem(pageKey));
    }
};