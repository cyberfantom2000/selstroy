import { requestModels, requestAllModels, createModel, removeModel, updateModel, queryModels } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class ProjectApi {
    async requestProjects(limit=100, offset=0, fields=[]) {
        return await requestModels(ApiUrls.project, limit, offset, fields);
    }

    async requestAllProjects(fields=[]) {
        return await requestAllModels(this.requestProjects, fields);
    }

    async queryProject(filters=[], fields=[]) {
        return await queryModels(ApiUrls.project, filters, fields)
    }

    async createProject(data) {
        return await createModel(ApiUrls.project, data);
    }

    async removeProject(id) {
        return await removeModel(ApiUrls.project, id);
    }

    async updateProject(data) {
        return await updateModel(ApiUrls.project, data);
    }

    async createProjectDetail(data) {
        return await createModel(ApiUrls.projectDetails, data);
    }

    async updateProjectDetail(data) {
        return await updateModel(ApiUrls.projectDetails, data);
    }

    async removeProjectDetail(id) {
        return await removeModel(ApiUrls.projectDetails, id);
    }
}