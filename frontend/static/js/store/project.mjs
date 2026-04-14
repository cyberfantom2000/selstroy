import { mediaUrl } from "../api/base-urls.mjs";
import { ProjectEvents, ModelErrorType } from "../core/events.mjs";


function normalizeImage(data) {
    return {
        id: data.id,
        url: `${mediaUrl}/${data.id}`
    };
}


function normalizeProjectDetail(data) {
    let result = {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        text: data.text
    };

    if (data.images)
        result.images = data.images.map(normalizeImage);

    return result;
}


function normalizeProject(data) {
    let result = {
        id: data.id,
        title: data.title,
        tags: data.tags,
        squareMax: data.square_max,
        squareMin: data.square_min,
        isDraft: data.is_draft,
        releaseDate: data.release_date,
        saleStatus: data.sale_status,
        slug: data.slug,
        liveMap: data.live_map,
        details: [],
        images: [],
    };

    if (data.preview_image)
        result.previewImage = normalizeImage(data.preview_image);

    if (data.master_plan)
        result.masterPlaneImage = normalizeImage(data.master_plan);

    if (data.details)
        result.details = data.details.map(normalizeProjectDetail);

    if (data.images)
        result.images = data.images.map(normalizeImage);
    
    return result;
}


function denormalize(data, bindings) {
    let result = {};
    for (const [from, to] of Object.entries(bindings)) {
        if (from in data)
            result[to] = data[from];
    }
    return result;
}


function denormalizeProjectDetail(data) {
    const bindings = {id: 'id', projectId: 'project_id', title: 'title', text: 'text'};
    let result = denormalize(data, bindings);

    if (data.images)
        result.images_ids = data.images.map(el => el.id);

    return result;
}


function denormalizeProject(data) {
    const bindings = {id: 'id', title: 'title', squareMax: 'square_max', squareMin: 'square_min', tags: 'tags',
                      isDraft: 'is_draft', releaseDate: 'release_date', saleStatus: 'sale_status', slug: 'slug',
                      liveMap: 'live_map'};
    let result = denormalize(data, bindings);

    if (data.images)
        result.images_ids = data.images.map(el => el.id);

    if (data.previewImage)
        result.preview_image_id = data.previewImage.id;

    if (data.masterPlaneImage)
        result.master_plan_id = data.masterPlaneImage.id;

    return result;
}


export class ProjectStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
        this.projects = [];
        this.requestId = 0;
    }

    async load() {
        const requestId = ++this.requestId;
        try {
            const data = await this.api.requestAllProjects();
            if (requestId !== this.requestId) return;

            this.projects = data.map(normalizeProject);
            this.bus.emit(ProjectEvents.Update, this.projects);
        } catch(err) {
            if (requestId !== this.requestId) return;
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Load, err.toString());
            console.log(err);
        }
    }

    async createProject(data) {
        try {
            const reply = normalizeProject(await this.api.createProject(denormalizeProject(data)));
            this.projects = [reply, ...this.projects];
            this.bus.emit(ProjectEvents.Update, this.projects);
        } catch(err) {
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async updateProject(data) {
        try {
            const reply = normalizeProject(await this.api.updateProject(denormalizeProject(data)));
            const index = this.projects.findIndex(el => reply.id === el.id);
            this.projects[index] = reply;
            this.bus.emit(ProjectEvents.Update, this.projects);
        } catch(err) {
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }

    async removeProject(id) {
        try {
            await this.api.removeProject(id);
            this.projects = this.projects.filter(el => el.id !== id);
            this.bus.emit(ProjectEvents.Update, this.projects);
        } catch (err) {
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }

    async createDetail(data) {
        try {
            const reply = normalizeProjectDetail(await this.api.createProjectDetail(denormalizeProjectDetail(data)));
            const project = this.projects.find(el => el.id === reply.projectId);
            project.details = [...project.details, reply];
            this.bus.emit(ProjectEvents.Update, this.projects);
        } catch (err) {
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Create, err.toString());
            console.log(err);
        }
    }

    async updateDetail(data) {
        try {
            const reply = normalizeProjectDetail(await this.api.updateProjectDetail(denormalizeProjectDetail(data)));
            const project = this.projects.find(el => el.id === reply.projectId);
            const index = project.details.findIndex(el => el.id === reply.id);
            project.details[index] = reply;
            this.bus.emit(ProjectEvents.Update, this.projects);
        } catch (err) {
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Update, err.toString());
            console.log(err);
        }
    }

    async removeDetail(id) {
        try {
            await this.api.removeProjectDetail(id);
            for(const project of this.projects) {
                const index = project.details.findIndex(el => el.id === id);
                if (index !== -1) {
                    project.details = [...project.details.slice(0, index), ...project.details.slice(index + 1)];
                    this.bus.emit(ProjectEvents.Update, this.projects);
                    break;
                }
            }
        } catch (err) {
            this.bus.emit(ProjectEvents.Error, ModelErrorType.Remove, err.toString());
            console.log(err);
        }
    }
}