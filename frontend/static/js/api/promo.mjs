import { requestModels, requestAllModels, updateModel, createModel, removeModel } from "./model.mjs";
import { promoUrl } from "./base-urls.mjs";


export class PromoApi {
    async request(limit=100, offset=0, fields=[]) {
        return await requestModels(promoUrl, limit, offset, fields);
    }

    async requestAll(fields=[]) {
        return await requestAllModels(this.request, fields);
    }

    async update(data) {
        return await updateModel(promoUrl, data);
    }

    async create(data) {
        return await createModel(promoUrl, data);
    }
    
    async remove(id) {
        return await removeModel(promoUrl, id);
    }
}
