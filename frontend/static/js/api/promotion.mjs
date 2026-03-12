import { requestModels, requestAllModels } from "./model.mjs";
import { promoUrl } from "./base-urls.mjs";


export async function requestPromos(limit=100, offset=0, fields=[]) {
    return await requestModels(promoUrl, limit, offset, fields);
}

export async function requestAllPromos(fields=[]) {
    return await requestAllModels(requestPromos, fields);
}