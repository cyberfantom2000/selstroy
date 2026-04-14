import { createModel, removeModel, updateModel, requestModels, requestAllModels } from "./model.mjs";
import { apartmentUrl, apartmentImageUrl, apartmentElementUrl } from "./base-urls.mjs";


export class ApartmentApi {
    async requestApartments(limit=100, offset=0, fields=[]) {
            return await requestModels(apartmentUrl, limit, offset, fields);
    }
    
    async requestAllApartments(fields=[]) {
        return await requestAllModels(this.requestApartments, fields);
    }

    async createApartment(data) {
        return await createModel(apartmentUrl, data);
    }

    async updateApartment(data) {
        return await updateModel(apartmentUrl, data);
    }

    async removeApartment(id) {
        return await removeModel(apartmentUrl, id);
    }

    async createImage(data) {
        return await createModel(apartmentImageUrl, data);
    }

    async updateImage(data) {
        return await updateModel(apartmentImageUrl, data);
    }

    async removeImage(id) {
        return await removeModel(apartmentImageUrl, id);
    }

    async createFloor(data) {
        return await createModel(apartmentElementUrl, data);
    }

    async updateFloor(data) {
        return await updateModel(apartmentElementUrl, data);
    }

    async removeFloor(id) {
        return await removeModel(apartmentElementUrl, id);
    }
}