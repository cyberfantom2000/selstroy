import { requestModels, requestAllModels, updateModel, createModel, removeModel } from "./model.mjs";
import { promoUrl } from "./base-urls.mjs";


export async function requestPromos(limit=100, offset=0, fields=[]) {
    return await requestModels(promoUrl, limit, offset, fields);
}

export async function requestAllPromos(fields=[]) {
    return await requestAllModels(requestPromos, fields);
}

export async function updatePromo(data) {
    return await updateModel(promoUrl, data);
}

export async function createPromo(data) {
    return await createModel(promoUrl, data);
}

export async function setPromoDraftStatus(id, isDraft) {
    return await updatePromo({id: id, is_draft: isDraft});
}

export async function deletePromo(id) {
    return await removeModel(promoUrl, id);
}