import { ProjectItem } from "../item.mjs";
import { ImagesContainer } from "../../components/images-container.mjs";
import { AdminProjectDetailsContainer } from "./detail-container.mjs";
import { EditableImage } from "../../components/editable-image.mjs";
import { EditableIFrame } from "../../components/editable-iframe.mjs";
import { AdminProjectDescription } from "./description.mjs";
import { ProjectEvents, ProjectImageType} from "../../core/events.mjs";


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

        this.description = new AdminProjectDescription(this.element.querySelector('[name="description-container"]'));

        this.description.editClicked = () => this.bus.emit(ProjectEvents.Request.Project.Edit, this.data);

        this.carousel = new ImagesContainer({
            container: this.element.querySelector('[name="carousel-container"]'),
            registry: registry
        });

        this.carousel.imageClicked = (url) => this.bus.emit(ProjectEvents.Request.Image.Open, url);
        this.carousel.imageAddClicked = () => {
            this.bus.emit(ProjectEvents.Request.Image.Create, {
                context: {...this.data, type: ProjectImageType.Carousel, request: ProjectEvents.Request.Image.Create},
            });
        }; 
        this.carousel.imageEditClicked = (imgData) => {
            this.bus.emit(ProjectEvents.Request.Image.Edit, {
                context: {...this.data, type: ProjectImageType.Carousel, request: ProjectEvents.Request.Image.Edit},
                data: imgData
            });
        }; 
        this.carousel.imageRemoveClicked = (imgData) => {
            this.bus.emit(ProjectEvents.Request.Image.Remove, {
                context: {...this.data, type: ProjectImageType.Carousel},
                data: imgData
            });
        };

        this.details = new AdminProjectDetailsContainer({
            element: this.element.querySelector('[name="details-container"]'),
            registry: registry
        });

        this.details.detailAddClicked = () => this.bus.emit(ProjectEvents.Request.ProjectDetail.Create, {projectId: this.data.id});
        this.details.detailEditClicked = (detailData) => this.bus.emit(ProjectEvents.Request.ProjectDetail.Edit, detailData);
        this.details.detailRemoveClicked = (detailData) => this.bus.emit(ProjectEvents.Request.ProjectDetail.Remove, detailData);
        this.details.detailImageClicked = (url) => this.bus.emit(ProjectEvents.Request.Image.Open, url);
        this.details.detailImageAddClicked = (detailData) => {
            this.bus.emit(ProjectEvents.Request.Image.Create, {
                context: {...detailData, type: ProjectImageType.Detail, request: ProjectEvents.Request.Image.Create}
            });
        };
        this.details.detailImageEditClicked = (detailData, imgData) => {
            this.bus.emit(ProjectEvents.Request.Image.Edit, {
                context: {...detailData, type: ProjectImageType.Detail, request: ProjectEvents.Request.Image.Edit},
                data: imgData
            });
        }; 
        this.details.detailImageRemoveClicked = (detailData, imgData) => {
            this.bus.emit(ProjectEvents.Request.Image.Remove, {
                context: {...detailData, type: ProjectImageType.Detail},
                data: imgData
            });
        }; 

        this.previewImage = new EditableImage(registry.getTemplate('editable-image-template'));
        this.previewImage.setRemoveButtonVisible(false);
        this.element.querySelector('[name="preview-image-container"]').appendChild(this.previewImage.element);

        this.previewImage.clicked = (url) => this.bus.emit(ProjectEvents.Request.Image.Open, url);
        this.previewImage.editClicked = () => {
            this.bus.emit(ProjectEvents.Request.Image.Edit, {
                context: {...this.data, type: ProjectImageType.Preview},
                data: this.previewImage.data
            });
        }; 

        this.masterPlane = new EditableImage(registry.getTemplate('editable-image-template'));
        this.masterPlane.setRemoveButtonVisible(false);
        this.element.querySelector('[name="master-plane-image-container"]').appendChild(this.masterPlane.element);

        this.masterPlane.clicked = (url) => this.bus.emit(ProjectEvents.Request.Image.Open, url);
        this.masterPlane.editClicked = () => {
            this.bus.emit(ProjectEvents.Request.Image.Edit, {
                context: {...this.data, type: ProjectImageType.MasterPlan},
                data: this.masterPlane.data
            });
        }; 

        this.liveMap = new EditableIFrame(registry);
        this.element.querySelector('[name="interactive-map-container"]').appendChild(this.liveMap.element);

        this.liveMap.clicked = () => this.bus.emit(ProjectEvents.Request.IFrame.Open, this.liveMap.data);
        this.liveMap.editClicked = () => this.bus.emit(ProjectEvents.Request.IFrame.Edit, { data: this.liveMap.data, context: {...this.data} });

        this.element.querySelector('[name="item-container"]').appendChild(this.baseItem.element);
    }

    update(data) {
        this.data = data;
        this.baseItem.update(data);
        this.description.update(data);
        this.details.update(data.details);
        this.previewImage.update(data.previewImage);
        this.masterPlane.update(data.masterPlaneImage);
        this.liveMap.update(data.liveMap);
        this.carousel.update(data.images);
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