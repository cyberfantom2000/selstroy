import { ApiUrls, BaseUrls } from "../api/base-urls.mjs";
import { ApartmentEvents, ModelErrorType } from "../core/events.mjs";
import { denormalize } from "./common.mjs";


function normalizeApartmentImage(data) {
    return {
        id: data.id,
        apartmentId: data.apartment_id,
        category: data.category,
        imageId: data.image ? data.image.id : '',
        url: data.image ? `${ApiUrls.media}/${data.image.id}` : ''
    };
}


function normalizeFloor(data) {
    return {
        id: data.id,
        apartmentId: data.apartment_id,
        floor: data.floor,
        number: data.number,
        cost: data.cost
    };
}


function normalizeApartment(data) {
    let result = {
        id: data.id,
        projectId: data.project_id,
        square: data.square,
        isDraft: data.is_draft,
        type: data.type,
        totalFloors: data.total_floors,
        slug: data.slug,
        url: `${BaseUrls.apartment}/${data.slug}`,
        pdfId: data.pdf ? data.pdf.id : '',
        pdfUrl: data.pdf ? `${ApiUrls.media}/${data.pdf.id}` : '',
        images: [],
        floors: []
    };

    if (data.images)
        result.images = data.images.map(normalizeApartmentImage);

    if (data.items)
        result.floors = data.items.map(normalizeFloor);
    
    return result;
}


function denormalizeApartmentImage(data) {
    const bindings = {id: 'id',  apartmentId: 'apartment_id', category: 'category', imageId: 'image_id'};
    return denormalize(data, bindings);
}


function denormalizeFloor(data) {
    const bindings = {id: 'id', apartmentId: 'apartment_id', floor: 'floor', number: 'number', cost: 'cost'};
    return denormalize(data, bindings);
}


function denormalizeApartment(data) {
    const bindings = {id: 'id', projectId: 'project_id', square: 'square', isDraft: 'is_draft', type: 'type', totalFloors: 'total_floors', slug: 'slug', pdfId: 'pdf_id'};
    return denormalize(data, bindings);
}


export class ApartmentStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
        this.apartments = new Map();
        this.requestId = 0;
    }

    async load() {
        const requestId = ++this.requestId;
        try {
            const data = await this.api.requestAllApartments();
            if (requestId !== this.requestId) return;

            const apartments = data.map(normalizeApartment);
            const projectIds = new Set(apartments.map(el => el.projectId));
            for (const projectId of projectIds) {
                const projectApartments = apartments.filter(el => el.projectId === projectId);
                this.apartments.set(projectId, projectApartments);
                this.bus.emit(ApartmentEvents.Update, projectId, projectApartments);
            }
        } catch(err) {
            if (requestId !== this.requestId) return;
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Load, err.toString());
            console.log(err);
        }
    }

    async createApartment(data) {
        try {
            const reply = normalizeApartment(await this.api.createApartment(denormalizeApartment(data)));
            const projectApartments = [reply, ...(this.apartments.get(reply.projectId))];
            this.apartments.set(reply.projectId, projectApartments);
            this.bus.emit(ApartmentEvents.Update, reply.projectId, projectApartments);
        } catch(err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async updateApartment(data) {
        try {
            const reply = normalizeApartment(await this.api.updateApartment(denormalizeApartment(data)));
            const projectApartments = this.apartments.get(reply.projectId);
            const index = projectApartments.findIndex(el => reply.id === el.id);
            projectApartments[index] = reply;
            this.bus.emit(ApartmentEvents.Update, reply.projectId, this.apartments.get(reply.projectId));
        } catch(err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }

    async removeApartment(id) {
        try {
            await this.api.removeApartment(id);
            for(const [projectId, apartments] of this.apartments.entries()) {
                const index = apartments.findIndex(el => el.id === id);
                if (index !== -1) {
                    const newApartments = [...apartments.slice(0, index), ...apartments.slice(index + 1)];
                    this.apartments.set(projectId, newApartments);
                    this.bus.emit(ApartmentEvents.Update, projectId, newApartments);
                    break;
                }
            }
        } catch (err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }

    async createImage(data) {
        try {
            const reply = normalizeApartmentImage(await this.api.createImage(denormalizeApartmentImage(data)));
            let apartment = this.findApartment(reply.apartmentId);
            apartment.images = [...apartment.images, reply];
            this.bus.emit(ApartmentEvents.Update, apartment.projectId, this.apartments.get(apartment.projectId));
        } catch(err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async updateImage(data) {
        try {
            const reply = normalizeApartmentImage(await this.api.updateImage(denormalizeApartmentImage(data)));
            const apartment = this.findApartment(reply.apartmentId);
            const index = apartment.images.findIndex(el => el.id === reply.id);
            apartment.images[index] = reply;
            this.bus.emit(ApartmentEvents.Update, apartment.projectId, this.apartments.get(apartment.projectId));
        } catch(err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }
    
    async removeImage(apartmentId, imageId) {
        try {
            await this.api.removeImage(imageId);
            const apartment = this.findApartment(apartmentId);
            apartment.images = apartment.images.filter(el => el.id !== imageId);
            this.bus.emit(ApartmentEvents.Update, apartment.projectId, this.apartments.get(apartment.projectId));
        } catch (err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }

    async createFloor(data) {
        try {
            const reply = normalizeFloor(await this.api.createFloor(denormalizeFloor(data)));
            const apartment = this.findApartment(reply.apartmentId);
            apartment.floors = [...apartment.floors, reply];
            this.bus.emit(ApartmentEvents.Update, apartment.projectId, this.apartments.get(apartment.projectId));
        } catch(err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async updateFloor(data) {
        try {
            const reply = normalizeFloor(await this.api.updateFloor(denormalizeFloor(data)));
            const apartment = this.findApartment(reply.apartmentId);
            const index = apartment.floors.findIndex(el => el.id === reply.id);
            apartment.floors[index] = reply;
            this.bus.emit(ApartmentEvents.Update, apartment.projectId, this.apartments.get(apartment.projectId));
        } catch(err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }
    
    async removeFloor(apartmentId, floorId) {
        try {
            await this.api.removeFloor(floorId);
            const apartment = this.findApartment(apartmentId);
            apartment.floors = apartment.floors.filter(el => el.id !== floorId);
            this.bus.emit(ApartmentEvents.Update, apartment.projectId, this.apartments.get(apartment.projectId));
        } catch (err) {
            this.bus.emit(ApartmentEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }

    findApartment(id) {
        for(const apartments of this.apartments.values()) {
            const apartment = apartments.find(el => el.id === id);
            if (apartment) {
                return apartment;
            }
        }

        return null;
    }
}