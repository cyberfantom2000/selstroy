import { requestModels, requestAllModels, updateModel, createModel, removeModel } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class PromoApi {
    async request(limit=100, offset=0, fields=[]) {
        return await requestModels(ApiUrls.promo, limit, offset, fields);
    }

    async requestAll(fields=[]) {
        return await requestAllModels(this.request, fields);
    }

    async update(data) {
        return await updateModel(ApiUrls.promo, data);
    }

    async create(data) {
        return await createModel(ApiUrls.promo, data);
    }
    
    async remove(id) {
        return await removeModel(ApiUrls.promo, id);
    }
}
