import { requestModels, requestAllModels } from "./model.mjs";

const baseUrl = '/api/promotion';

export async function requestPromos(limit=100, offset=0, fields=[]) {
    return await requestModels(baseUrl, limit, offset, fields);
}

export async function requestAllPromos(fields=[]) {
    return await requestAllModels(requestPromos, fields);
}