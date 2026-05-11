import { requestModels, requestAllModels, removeModel, createModel, updateModel } from "./model.mjs";
import { galleryUrl } from "./base-urls.mjs";


export class GalleryApi {
    async requestItems(limit=100, offset=0, fields=[]) {
        return await requestModels(galleryUrl, limit, offset, fields);
    }

    async requestAllItems(fields=[]) {
        return await requestAllModels(this.requestItems, fields);
    }

    async createItem(data) {
        return await createModel(galleryUrl, data);
    }

    async updateItem(data) {
        return await updateModel(galleryUrl, data);
    }

    async removeItem(id) {
        return await removeModel(galleryUrl, id);
    }
}