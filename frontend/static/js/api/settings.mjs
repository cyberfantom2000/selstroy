import { requestModel, updateModel } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class SiteSettingsApi {
    async current() {
        return await requestModel(ApiUrls.settings);
    }

    async update(data) {
        return await updateModel(ApiUrls.settings, data);
    }
}
