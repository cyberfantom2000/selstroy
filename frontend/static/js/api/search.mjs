import { postJson } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class SearchApi {
    async requestFilters(projectIds = []) {
        return await postJson(ApiUrls.searchFilters, {projects: projectIds});
    }

    async searchApartments(filters = {}) {
        return await postJson(ApiUrls.searchApartments, filters);
    }
}
