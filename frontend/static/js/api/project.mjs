import { requestModels, requestAllModels, createModel, removeModel, updateModel } from "./model.mjs";

const baseUrl = '/api/project';

export async function requestProjects(limit=100, offset=0, fields=[]) {
    return await requestModels(baseUrl, limit, offset, fields);
}

export async function requestAllProjects(fields=[]) {
    return await requestAllModels(requestProjects, fields);
}

export async function requestAllProjectsShortDescription() {
    return await requestAllProjects(['id', 'title', 'square_min', 'square_max', 'preview_image', 'release_date', 'sale_status']);
}

export async function createProject(data) {
    return await createModel(baseUrl, data);
}

export async function deleteProject(id) {
    return await removeModel(baseUrl, id);
}

export async function updateProject(data) {
    return await updateModel(baseUrl, data);
}

export async function setDraftStatus(id, isDraft) {
    return await updateProject({id: id, is_draft: isDraft});
}

