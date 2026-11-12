import { ProjectItem } from "../item.mjs";
import { ImagesContainer } from "../../components/images-container.mjs";
import { AdminProjectDetailsContainer } from "./detail-container.mjs";
import { EditableImage } from "../../components/editable-image.mjs";
import { EditableHtml } from "../../components/editable-html.mjs";
import { AdminProjectParameters } from "./description.mjs";
import { ProjectEvents, ProjectFileType, ProjectDetailType } from "../../core/events.mjs";


export class AdminProjectItem {
    constructor({registry, bus}) {
        this.bus = bus;
        this.element = registry.getTemplate('project-item-admin-template');

        this.previewButton = this.element.querySelector('[name="preview-button"]');
        this.draftButton = this.element.querySelector('[name="draft-button"]');
        this.deleteButton = this.element.querySelector('[name="delete-button"]');

        this.previewButton.onclick = () => this.bus.emit(ProjectEvents.Request.Project.Preview, this.data);
        this.draftButton.onclick = () => this.bus.emit(ProjectEvents.Request.Project.ToggleDraft, this.data);
        this.deleteButton.onclick = () => this.bus.emit(ProjectEvents.Request.Project.Remove, this.data);

        this.baseItem = new ProjectItem(registry);

        this.parameters = new AdminProjectParameters(this.element.querySelector('[name="description-container"]'));

        this.parameters.editClicked = () => this.bus.emit(ProjectEvents.Request.Project.Edit, this.data);

        this.description = new AdminProjectDetailsContainer({
            element: this.element.querySelector('[name="detail-description-container"]'),
            registry: registry
        });
        this.description.setRemoveDisable(true);

        this.description.detailEditClicked = (detailData) => {
            this.bus.emit(ProjectEvents.Request.ProjectDetail.Edit, {...detailData, type: ProjectDetailType.Description});
        };
        this.description.detailImageClicked = (url) => this.bus.emit(ProjectEvents.Request.File.Open, {url: url, type: ProjectFileType.Description});
        this.description.detailImageAddClicked = (detailData) => {
            this.bus.emit(ProjectEvents.Request.File.Create, {
                context: {...detailData, type: ProjectFileType.Description, request: ProjectEvents.Request.File.Create}
            });
        };
        this.description.detailImageEditClicked = (detailData, imgData) => {
            this.bus.emit(ProjectEvents.Request.File.Edit, {
                context: {...detailData, type: ProjectFileType.Description, request: ProjectEvents.Request.File.Edit},
                data: imgData
            });
        };
        this.description.detailImageRemoveClicked = (detailData, imgData) => {
            this.bus.emit(ProjectEvents.Request.File.Remove, {
                context: {...detailData, type: ProjectFileType.Description},
                data: imgData
            });
        };

        this.details = new AdminProjectDetailsContainer({
            element: this.element.querySelector('[name="details-container"]'),
            registry: registry
        });

        this.details.detailAddClicked = () => this.bus.emit(ProjectEvents.Request.ProjectDetail.Create, {projectId: this.data.id});
        this.details.detailEditClicked = (detailData) => {
            this.bus.emit(ProjectEvents.Request.ProjectDetail.Edit, {...detailData, type: ProjectDetailType.Detail});
        };
        this.details.detailRemoveClicked = (detailData) => this.bus.emit(ProjectEvents.Request.ProjectDetail.Remove, detailData);
        this.details.detailImageClicked = (url) => this.bus.emit(ProjectEvents.Request.File.Open, {url: url, type: ProjectFileType.Detail});
        this.details.detailImageAddClicked = (detailData) => {
            this.bus.emit(ProjectEvents.Request.File.Create, {
                context: {...detailData, type: ProjectFileType.Detail, request: ProjectEvents.Request.File.Create}
            });
        };
        this.details.detailImageEditClicked = (detailData, imgData) => {
            this.bus.emit(ProjectEvents.Request.File.Edit, {
                context: {...detailData, type: ProjectFileType.Detail, request: ProjectEvents.Request.File.Edit},
                data: imgData
            });
        };
        this.details.detailImageRemoveClicked = (detailData, imgData) => {
            this.bus.emit(ProjectEvents.Request.File.Remove, {
                context: {...detailData, type: ProjectFileType.Detail},
                data: imgData
            });
        };

        this.previewImage = new EditableImage(registry.getTemplate('editable-image-template'));
        this.element.querySelector('[name="preview-image-container"]').appendChild(this.previewImage.element);

        this.previewImage.clicked = (url) => this.bus.emit(ProjectEvents.Request.File.Open, {url: url, type: ProjectFileType.Preview});
        this.previewImage.editClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Edit, {
                context: {...this.data, type: ProjectFileType.Preview},
                data: this.previewImage.data
            });
        };
        this.previewImage.removeClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Remove, {
                context: {...this.data, type: ProjectFileType.Preview},
                data: this.previewImage.data
            });
        };

        this.masterPlane = new EditableImage(registry.getTemplate('editable-image-template'));
        this.element.querySelector('[name="master-plane-image-container"]').appendChild(this.masterPlane.element);

        this.masterPlane.clicked = (url) => this.bus.emit(ProjectEvents.Request.File.Open, {url: url, type: ProjectFileType.MasterPlan});
        this.masterPlane.editClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Edit, {
                context: {...this.data, type: ProjectFileType.MasterPlan},
                data: this.masterPlane.data
            });
        };
        this.masterPlane.removeClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Remove, {
                context: {...this.data, type: ProjectFileType.MasterPlan},
                data: this.masterPlane.data
            });
        };

        this.liveMap = new EditableHtml(registry.getTemplate('editable-html-template'));
        this.element.querySelector('[name="interactive-map-container"]').appendChild(this.liveMap.element);

        this.liveMap.clicked = (url) => this.bus.emit(ProjectEvents.Request.File.Open, {url: url, type: ProjectFileType.LiveMap});
        this.liveMap.editClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Edit, {
                context: {...this.data, type: ProjectFileType.LiveMap},
                data: this.liveMap.data
            });
        };
        this.liveMap.removeClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Remove, {
                context: {...this.data, type: ProjectFileType.LiveMap},
                data: this.liveMap.data
            });
        };

        this.floorPlan = new EditableHtml(registry.getTemplate('editable-html-template'));
        this.element.querySelector('[name="floor-plan-container"]').appendChild(this.floorPlan.element);

        this.floorPlan.clicked = (url) => this.bus.emit(ProjectEvents.Request.File.Open, {url: url, type: ProjectFileType.FloorPlan});
        this.floorPlan.editClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Edit, {
                context: {...this.data, type: ProjectFileType.FloorPlan},
                data: this.floorPlan.data
            });
        };
        this.floorPlan.removeClicked = () => {
            this.bus.emit(ProjectEvents.Request.File.Remove, {
                context: {...this.data, type: ProjectFileType.FloorPlan},
                data: this.floorPlan.data
            });
        };

        this.element.querySelector('[name="item-container"]').appendChild(this.baseItem.element);
    }

    update(data) {
        this.data = data;
        this.baseItem.update(data);
        this.parameters.update(data);
        this.description.update([data.description]);
        this.details.update(data.details);
        this.previewImage.update(data.previewImage);
        this.masterPlane.update(data.masterPlaneImage);
        this.floorPlan.update(data.floorPlan);
        this.liveMap.update(data.liveMap);
        this.setDraftButtonSelect(data.isDraft);
    }

    setButtonsEnabled(enabled) {
        this.previewButton.enabled = enabled;
        this.editButton.enabled = enabled;
        this.draftButton.enabled = enabled;
        this.deleteButton.enabled = enabled;
    }

    setDraftButtonSelect(select) {
        if (select) {
            this.draftButton.title = 'Опубликовать'
            this.draftButton.classList.add('text-primary-500', 'dark:text-primary-500');
        } else {
            this.draftButton.title = 'Сделать черновиком'
            this.draftButton.classList.remove('text-primary-500', 'dark:text-primary-500');
        }
    }
}
