import { requestModels, requestAllModels, createModel, removeModel, updateModel } from "./model.mjs";
import { projectUrl, projectDetailsUrl } from "./base-urls.mjs";


export class ProjectApi {
    async requestProjects(limit=100, offset=0, fields=[]) {
        return await requestModels(projectUrl, limit, offset, fields);
    }

    async requestAllProjects(fields=[]) {
        return await requestAllModels(this.requestProjects, fields);
    }

    async createProject(data) {
        return await createModel(projectUrl, data);
    }

    async removeProject(id) {
        return await removeModel(projectUrl, id);
    }

    async updateProject(data) {
        return await updateModel(projectUrl, data);
    }

    async createProjectDetail(data) {
        return await createModel(projectDetailsUrl, data);
    }

    async updateProjectDetail(data) {
        return await updateModel(projectDetailsUrl, data);
    }

    async removeProjectDetail(id) {
        return await removeModel(projectDetailsUrl, id);
    }
}