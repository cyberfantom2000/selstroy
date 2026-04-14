import { Page } from "../page.mjs";
import { AdminProjectGroup } from "./project-group.mjs";
import { ProjectEvents, ApartmentEvents } from "../../core/events.mjs";


export class ProjectsSubpage extends Page {
    constructor({registry, bus}) {
        super({pageContainer: registry.get('projects-subpage'), itemsContainer: registry.get('projects-subpage-container')});
        this.registry = registry;
        this.bus = bus;
        this.items = new Map();

        this.createButton = registry.get('create-project-button');
        this.createButton.onclick = () => this.bus.emit(ProjectEvents.Request.Project.Create);

        this.bus.on(ProjectEvents.Update, (projects) => this.projectsChanged(projects));
        this.bus.on(ProjectEvents.Clear, () => this.clear());

        this.bus.on(ApartmentEvents.Update, (projectId, apartments) => this.apartmentsChanged(projectId, apartments));
    }

    projectsChanged(projects) {
        const newIds = new Set(projects.map(i => i.id));
        for (const [id, item] of this.items.entries()) {
            if (!newIds.has(id)) {
                item.element.remove();
                this.items.delete(id);
            }
        }

        for (const data of projects) {
            if (!this.items.has(data.id)) {
                const item = new AdminProjectGroup({registry: this.registry, bus: this.bus});
                this.items.set(data.id, item);
                this.pushItemToFront(item.element)
            }

            this.items.get(data.id).updateProject(data);
        }
    }

    apartmentsChanged(projectId, apartments) {
        this.items.get(projectId)?.updateApartments(apartments);
    }

    // async load() {
    //     try {
    //         const items = await requestAllProjects();
    //         for (const data of items) {
    //             const item = this.buildProjectGroup(data);
    //             this.pushItemToFront(item);
    //         }
    //     } catch (err) {
    //         // TODO toast message
    //         console.log(err);
    //         this.timer.start(() => {
    //             this.timer.stop();
    //             this.clear();
    //             this.load();
    //         });
    //     }
    // }

    // buildProjectGroup(data) {
    //     const group = new AdminProjectGroup({ data: data, templates: templates });

    //     group.projectDescriptionEditClicked = (description) => {
    //         this.modals.project.setTitle('Изменение проекта')
    //         this.modals.project.setData(description.data);

    //         this.modals.project.submitClicked  = (data) => {
    //             updateProject(data).then((reply) => {
    //                 description.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.project.show();
    //     };

    //     group.projectRemoveClicked = (project) => {
    //         this.modals.confirm.setText({title: 'Подтвердите действие', description: 'Вы действительно хотите удалить проект и все его элементы?'});
    //         this.modals.confirm.setSubmitButtonStyle('danger');
    //         this.modals.confirm.submitClicked = () => {
    //             deleteProject(project.data.id).then((reply) => {
    //                 group.element.remove();
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.confirm.show();
    //     };

    //     group.projectDraftClicked = (project, isDraft) => {
    //         setProjectDraftStatus(project.data.id, isDraft).then((reply) => {
    //             project.update(reply);
    //             // TODO toast message
    //         }).catch((err) => {
    //             // TODO toast message
    //             console.log(err);
    //         });
    //     };

    //     group.projectImageClicked = (url) => { /* TODO */ };

    //     group.projectPreviewImageEditClicked = (project, image) => {
    //         this.modals.image.setData(image.data.id);
    //         this.modals.image.submitClicked = (id) => {
    //             updateProject({id: project.data.id, preview_image_id: id}).then((reply) => {
    //                 image.update(reply.preview_image);
    //                 project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.image.show();
    //     };

    //     group.projectMasterPlaneEditClicked = (project, image) => {
    //         this.modals.image.setData(image.data.id);
    //         this.modals.image.submitClicked = (id) => {
    //             updateProject({id: project.data.id, master_plan_id: id}).then((reply) => {
    //                 image.update(reply.master_plan);
    //                 project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.image.show();
    //     };

    //     group.projectCarouselAddClicked = (project, carousel) => {
    //         this.modals.image.clearData();
    //         this.modals.image.submitClicked = (id) => {
    //             const ids = project.data.images.map(item => item.id).push(id);
    //             updateProject({id: project.data.id, images_ids: ids}).then((reply) => {
    //                 carousel.clear();
    //                 for (const data of reply.images)
    //                     carousel.add(data);

    //                 project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.image.show();
    //     }

    //     group.projectCarouselItemEditClicked = (project, image) => {
    //         this.modals.image.setData(image.data.id);
    //         this.modals.image.submitClicked = (id) => {
    //             if (id === image.data.id)
    //                 return;

    //             const ids = project.data.images.map(item => { return item.id === image.id ? id : item.id; });
    //             updateProject({id: project.data.id, images_ids: ids}).then((reply) => {
    //                 const item = reply.images.find(item => item.id == data.id);
    //                 if (item)
    //                     image.update(item);
    //                 else
    //                     console.log('Image not found error');
                    
    //                 this.project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.image.show();
    //     };

    //     group.projectCarouselItemRemoveClicked = (project, image) => {
    //         this.modals.confirm.setText({title: 'Подтвердите действие', description: 'Вы действительно хотите удалить изображение?'});
    //         this.modals.confirm.setSubmitButtonStyle('danger');
    //         this.modals.confirm.submitClicked = () => {
    //             const ids = project.data.images.filter(item => item.id !== image.id);
    //             updateProject({id: project.data.id, images_ids: ids}).then((reply) => {
    //                 image.remove();
    //                 project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.confirm.show();
    //     }

    //     group.projectIframeClicked = (data) => { /* TODO */ };

    //     group.projectLiveMapEditClicked = (project, iframe) => {
    //         this.modals.iframe.setData(iframe.data);
    //         this.modals.iframe.submitClicked = (text) => {
    //             updateProject({id: project.data.id, live_map: text}).then((reply) => {
    //                 iframe.update(reply.live_map);
    //                 project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.iframe.show();
    //     };

    //     group.projectDescriptionEditClicked = (description) => {
    //         this.modals.project.setData(description.data);
    //         this.modals.submitClicked = (data) => {
    //             updateProject(data).then((reply) => {
    //                project.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.project.show();
    //     };

    //     group.projectDetailAddClicked = (projectId, container) => {
    //         this.modals.projectDetail.clearData();
    //         this.modals.projectDetail.setData({project_id: projectId});
    //         this.modals.projectDetail.submitClicked = (data) => {
    //             createProjectDetail(data).then((reply) => {
    //                 container.add(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.projectDetail.show();
    //     };

    //     group.projectDetailEditClicked = (projectId, detail) => {
    //         this.modals.projectDetail.clearData();
    //         this.modals.projectDetail.setData({...detail.data, project_id: projectId});
    //         this.modals.projectDetail.submitClicked = (data) => {
    //             updateProjectDetail(data).then((reply) => {
    //                 detail.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.projectDetail.show();
    //     };

    //     group.projectDetailRemoveClicked = (detail) => {
    //         this.modals.confirm.setText({title: 'Подтвердите действие', description: 'Вы действительно хотите удалить элемент?'});
    //         this.modals.confirm.setSubmitButtonStyle('danger');
    //         this.modals.confirm.submitClicked = () => {
    //             deleteProjectDetail(detail.data.id).then((reply) => {
    //                 detail.element.remove();
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.confirm.show();
    //     };


    //     group.apartmentAddClicked = (projectId) => {
    //         this.modals.apartmentDescription.setTitle('Создание новой планировки');
    //         this.modals.apartmentDescription.clearData();
    //         this.modals.apartmentDescription.setData({project_id: projectId});
    //         this.modals.apartmentDescription.submitClicked = (data) => {
    //             createApartment(data).then((reply) => {
    //                 group.addApartment(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         }

    //         this.modals.apartmentDescription.show();
    //     };

    //     group.apartmentRemoveClicked = (apartment) => {
    //         this.modals.confirm.setText({title: 'Подтвердите действие', description: 'Вы действительно хотите удалить планировку и все ее элементы?'});
    //         this.modals.confirm.setSubmitButtonStyle('danger');
    //         this.modals.confirm.submitClicked = () => {
    //             deleteApartment(apartment.data.id).then((reply) => {
    //                 apartment.element.remove();
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.confirm.show();
    //     }

    //     group.apartmentImageAddClicked = (apartment) => {
    //         this.modals.apartmentImage.setTitle('Добавление изображения');
    //         this.modals.apartmentImage.clearData();
    //         this.modals.apartmentImage.setData({ apartment_id: apartment.data.id });
    //         this.modals.apartmentImage.submitClicked = (data) => {
    //             createApartmentImage(data).then((reply) => {
    //                 apartment.addImage(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.apartmentImage.show();
    //     };

    //     group.apartmentImageEditClicked = (apartmentId, image) => {
    //         this.modals.apartmentImage.setTitle('Изменить изображение');
    //         this.modals.apartmentImage.clearData();
    //         this.modals.apartmentImage.setData({...image.data, apartment_id: apartmentId});
    //         this.modals.apartmentImage.submitClicked = (data) => {
    //             updateApartmentImage(data).then((reply) => {
    //                 image.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };
    //         this.modals.apartmentImage.show();
    //     };

    //     group.apartmentImageRemoveClicked = (image) => {
    //         this.modals.confirm.setText({title: 'Подтвердите действие', description: 'Вы действительно хотите удалить изображение?'});
    //         this.modals.confirm.setSubmitButtonStyle('danger');
    //         this.modals.confirm.submitClicked = () => {
    //             deleteApartmentImage(image.data.id).then((reply) => {
    //                 image.element.remove();
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.confirm.show();
    //     };

    //     group.apartmentFloorAddClicked = (apartment) => {
    //         this.modals.apartmentFloor.setTitle('Добавление квартиры');
    //         this.modals.apartmentFloor.clearData();
    //         this.modals.apartmentFloor.setData({ apartment_id: apartment.data.id });
    //         this.modals.apartmentFloor.submitClicked = (data) => {
    //             createApartmentFloor(data).then((reply) => {
    //                 apartment.addFloor(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.apartmentFloor.show();
    //     };

    //     group.apartmentFloorEditClicked = (apartmentId, floor) => {
    //         this.modals.apartmentFloor.setTitle('Изменить квартиру');
    //         this.modals.apartmentFloor.clearData();
    //         this.modals.apartmentFloor.setData({...floor.data, apartment_id: apartmentId});
    //         this.modals.apartmentFloor.submitClicked = (data) => {
    //             updateApartmentFloor(data).then((reply) => {
    //                 floor.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };
    //         this.modals.apartmentFloor.show();
    //     };

    //     group.apartmentFloorRemoveClicked = (floor) => {
    //         this.modals.confirm.setText({title: 'Подтвердите действие', description: 'Вы действительно хотите удалить квартиру?'});
    //         this.modals.confirm.setSubmitButtonStyle('danger');
    //         this.modals.confirm.submitClicked = () => {
    //             deleteApartmentFloor(floor.data.id).then((reply) => {
    //                 floor.element.remove();
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.confirm.show();
    //     };

    //     group.apartmentDescriptionEditClicked = (projectId, description) => {
    //         this.modals.apartmentDescription.setTitle('Изменение описания');
    //         this.modals.apartmentDescription.clearData();
    //         this.modals.apartmentDescription.setData({...description.data, project_id: projectId});
    //         this.modals.apartmentDescription.submitClicked = (data) => {
    //             updateApartment(data).then((reply) => {
    //                 description.update(reply);
    //                 // TODO toast message
    //             }).catch((err) => {
    //                 // TODO toast message
    //                 console.log(err);
    //             });
    //         };

    //         this.modals.apartmentDescription.show();
    //     };
        
    //     return group;
    // }

    // onCreateProject() {
    //     this.modals.project.setTitle('Создание нового проекта')
    //     this.modals.project.clearData();

    //     this.modals.project.submitClicked  = (data) => {
    //         createProject(data).then((reply) => {
    //             const item = this.buildProjectGroup(reply);
    //             this.pushItemToFront(item);
    //             // TODO toast message
    //         }).catch((err) => {
    //             // TODO toast message
    //             console.log(err);
    //         });
    //     };

    //     this.modals.project.show();
    // }
}