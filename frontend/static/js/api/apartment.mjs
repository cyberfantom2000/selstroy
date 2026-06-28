import { createModel, removeModel, updateModel, requestModels, requestAllModels } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class ApartmentApi {
    async requestApartments(limit=100, offset=0, fields=[]) {
            return await requestModels(ApiUrls.apartment, limit, offset, fields);
    }
    
    async requestAllApartments(fields=[]) {
        return await requestAllModels(this.requestApartments, fields);
    }

    async createApartment(data) {
        return await createModel(ApiUrls.apartment, data);
    }

    async updateApartment(data) {
        return await updateModel(ApiUrls.apartment, data);
    }

    async removeApartment(id) {
        return await removeModel(ApiUrls.apartment, id);
    }

    async createImage(data) {
        return await createModel(ApiUrls.apartmentImage, data);
    }

    async updateImage(data) {
        return await updateModel(ApiUrls.apartmentImage, data);
    }

    async removeImage(id) {
        return await removeModel(ApiUrls.apartmentImage, id);
    }

    async createFloor(data) {
        return await createModel(ApiUrls.apartmentElement, data);
    }

    async updateFloor(data) {
        return await updateModel(ApiUrls.apartmentElement, data);
    }

    async removeFloor(id) {
        return await removeModel(ApiUrls.apartmentElement, id);
    }
}