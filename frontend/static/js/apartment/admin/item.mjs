import { ImagesContainer } from "../../common/images-container.mjs";
import { ApartmentEvents } from "../../core/events.mjs";
import { AdminApartmentFloorsContainer } from "./floors-container.mjs";
import { AdminApartmentDescription } from "./description.mjs";


export class AdminApartmentItem {
    constructor({registry, bus}) {
        this.bus = bus;
        this.element =  registry.getTemplate('apartment-item-admin-template');

        this.removeBtn = this.element.querySelector('[name="remove-button"]');
        this.draftBtn = this.element.querySelector('[name="draft-button"]');
        this.previewBtn = this.element.querySelector('[name="preview-button"]');

        this.removeBtn.onclick = () => this.bus.emit(ApartmentEvents.Request.Apartment.Remove, this.data);
        this.draftBtn.onclick = () => this.bus.emit(ApartmentEvents.Request.Apartment.ToggleDraft, this.data);
        this.previewBtn.onclick = () => this.bus.emit(ApartmentEvents.Request.Apartment.Preview, this.data);

        this.images = new ImagesContainer({
            container: this.element.querySelector('[name="images-container"]'),
            registry: registry
        });

        this.images.imageClicked = (url) => this.bus.emit(ApartmentEvents.Request.Image.Open, url);
        this.images.imageAddClicked = () => this.bus.emit(ApartmentEvents.Request.Image.Create, {apartmentId: this.data.id});
        this.images.imageEditClicked = (imgData) => this.bus.emit(ApartmentEvents.Request.Image.Edit, imgData);
        this.images.imageRemoveClicked = (imgData) => this.bus.emit(ApartmentEvents.Request.Image.Remove, imgData);

        this.description = new AdminApartmentDescription(this.element.querySelector('[name="description"]'));

        this.description.editClicked = () => this.bus.emit(ApartmentEvents.Request.Apartment.Edit, this.data);

        this.floors = new AdminApartmentFloorsContainer({
            element: this.element.querySelector('[name="floors-container"]'), 
            registry: registry
        });

        this.floors.addClicked = () => this.bus.emit(ApartmentEvents.Request.Floor.Create, this.data.id);
        this.floors.itemEditClicked = (floorData) => this.bus.emit(ApartmentEvents.Request.Floor.Edit, floorData);
        this.floors.itemRemoveClicked = (floorData) => this.bus.emit(ApartmentEvents.Request.Floor.Remove, floorData);
    }

    update(data) {
        this.data = data;
        this.images.update(data.images);
        this.description.update(data);
        this.floors.update(data.floors);
        this.setDraftButtonSelect(data.isDraft);
    }

    setDraftButtonSelect(select) {
        if (select) {
            this.draftBtn.title = 'Опубликовать'
            this.draftBtn.classList.add('text-primary-500', 'dark:text-primary-500');
        } else {
            this.draftBtn.title = 'Сделать черновиком'
            this.draftBtn.classList.remove('text-primary-500', 'dark:text-primary-500');
        }
    }
}