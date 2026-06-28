import { requestModels, requestAllModels, removeModel, createModel, updateModel } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class GalleryApi {
    async requestItems(limit=100, offset=0, fields=[]) {
        return await requestModels(ApiUrls.gallery, limit, offset, fields);
    }

    async requestAllItems(fields=[]) {
        return await requestAllModels(this.requestItems, fields);
    }

    async createItem(data) {
        return await createModel(ApiUrls.gallery, data);
    }

    async updateItem(data) {
        return await updateModel(ApiUrls.gallery, data);
    }

    async removeItem(id) {
        return await removeModel(ApiUrls.gallery, id);
    }
}