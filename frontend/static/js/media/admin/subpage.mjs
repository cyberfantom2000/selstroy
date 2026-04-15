import { MediaEvents } from "../../core/events.mjs";
import { AdminMediaItem } from "./item.mjs";
import { Page } from "../../pages/page.mjs";
import { DndZone } from "../../components/dnd.mjs";
import { ChooseFileButton } from "../../components/choose-files-button.mjs";


export class AdminMediaSubpage extends Page {
    constructor({registry, bus}){
        super({ pageContainer: registry.get('media-subpage'), itemsContainer: registry.get('media-subpage-container') });
        
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();
        
        this.dnd = new DndZone({
            wrapper: registry.get('media-dnd-wrapper'),
            zone: registry.get('media-dnd-dropzone')
        });
        this.chooseButton = new ChooseFileButton({
            button: registry.get('media-choose-button'),
            input: registry.get('media-choose-input')
        });

        this.chooseButton.filesChoosed = (files) => this.bus.emit(MediaEvents.Request.Upload, files);
        this.dnd.filesDropped = (files) => this.bus.emit(MediaEvents.Request.Upload, files);

        this.bus.on(MediaEvents.Update, (descriptors) => this.mediaChanged(descriptors));
        this.bus.on(MediaEvents.Clear, () => this.clear());
    }

    mediaChanged(descriptors) {
        const newIds = new Set(descriptors.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of descriptors) {
            if (!this.items.has(data.id)) {
                const item = new AdminMediaItem({registry: this.registry, bus: this.bus});
                this.items.set(data.id, item);
                this.pushItemToFront(item.element);   
            }

            this.items.get(data.id).update(data);
        }
    }
}