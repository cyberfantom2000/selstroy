import { Timer } from "../../utils/timer.mjs";
import { ProjectEvents, ModalEvents, PopupEvents, ModelErrorType, ProjectImageType } from "../../core/events.mjs";


export class AdminProjectController {
    constructor({bus, store}) {
        this.bus = bus;
        this.store = store;
        this.retryTimer = new Timer({delay: 10000, singleshot: true});

        this.bus.on(ProjectEvents.Error, (type, error) => this.onError(type, error));

        /* Project events */
        this.bus.on(ProjectEvents.Request.Project.Create, () => {
            this.bus.emit(ModalEvents.Project.Open, {
                title: 'Создать проект',
                data: {}
            });
        })

        this.bus.on(ProjectEvents.Request.Project.Edit, (data) => {
            this.bus.emit(ModalEvents.Project.Open,  {
                title: 'Редактировать проект',
                data: data
            });
        });

        this.bus.on(ProjectEvents.Request.Project.ToggleDraft, (data) => {
            this.store.updateProject({id: data.id, isDraft: !data.isDraft});
        });

        this.bus.on(ProjectEvents.Request.Project.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: ProjectEvents.Request.Project.Remove,
                style: 'danger',
                text: `Вы уверены что хотите удалить проект ${data.title}?`,
                data: data
            });
        });

        this.bus.on(ProjectEvents.Request.Project.Preview, (data) => {
            this.bus.emit(PopupEvents.Message.Inf.Show, "Эта функция пока не реализована");
        });

        /* Project image events */
        this.bus.on(ProjectEvents.Request.Image.Open, (url) => this.bus.emit(ModalEvents.ImageView.Open, url));

        this.bus.on(ProjectEvents.Request.Image.Create, ({context}) => {
            this.bus.emit(ModalEvents.EditableImage.Open, {
                context: context,
                data: {}
            });
        });

        this.bus.on(ProjectEvents.Request.Image.Edit, ({context, data}) => {
            this.bus.emit(ModalEvents.EditableImage.Open, {
                context: {...context, oldImageId: data.id},
                data: data
            });
        });

        this.bus.on(ProjectEvents.Request.Image.Remove, ({context, data}) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: context.type,
                context: context,
                style: 'danger',
                text: 'Вы уверены что хотите удалить изображение?',
                data: data
            });
        });

        /* Project details events */
        this.bus.on(ProjectEvents.Request.ProjectDetail.Create, ({projectId}) => {
            this.bus.emit(ModalEvents.ProjectDetail.Open, {
                title: 'Создать доп. описание проекта',
                data: { projectId: projectId }
            });
        });

        this.bus.on(ProjectEvents.Request.ProjectDetail.Edit, (data) => {
            this.bus.emit(ModalEvents.ProjectDetail.Open, {
                title: 'Изменить доп. описание проекта',
                data: data
            });
        });

        this.bus.on(ProjectEvents.Request.ProjectDetail.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: ProjectEvents.Request.ProjectDetail.Remove,
                style: 'danger',
                text: `Вы уверены что хотите удалить доп. описание проекта?`,
                data: data
            });
        });

        /* Project iframe events */
        this.bus.on(ProjectEvents.Request.IFrame.Open, (data) => this.bus.emit(ModalEvents.IFrameView.Open, data));

        this.bus.on(ProjectEvents.Request.IFrame.Edit, ({context, data}) =>  {
            this.bus.emit(ModalEvents.EditableIFrame.Open, {
                context: { ...context, type: ProjectEvents.Request.IFrame.Edit },
                data: data
            });
        });

        /* Modal events */
        this.bus.on(ModalEvents.Confirm.Confirmed, (payload) => {
            if (payload.type === ProjectImageType.Detail || payload.type === ProjectImageType.Description)
                this.store.updateDetail({id: payload.context.id, images: payload.context.images.filter(el => el.id !== payload.data.id)});
            
            if (payload.type === ProjectEvents.Request.Project.Remove)
                this.store.removeProject(payload.data.id);
            
            if (payload.type === ProjectEvents.Request.ProjectDetail.Remove)
                this.store.removeDetail(payload.data.id);
        });

        this.bus.on(ModalEvents.EditableImage.Confirmed, ({data, context}) => {
            const base = {id: context.id};

            if (context.type === ProjectImageType.Preview)
                this.store.updateProject({...base, previewImage: data});

            if (context.type === ProjectImageType.MasterPlan)
                this.store.updateProject({...base, masterPlaneImage: data});

            if (context.type === ProjectImageType.Detail || context.type === ProjectImageType.Description) {
                let newImages = [];
                if (context.request === ProjectEvents.Request.Image.Create)
                    newImages = [...context.images, data];

                if (context.request === ProjectEvents.Request.Image.Edit) {
                    const index = context.images.findIndex(el => el.id === context.oldImageId);
                    newImages = [...context.images.slice(0, index), data, ...context.images.slice(index + 1)];
                }

                if (context.type === ProjectImageType.Detail)
                    this.store.updateDetail({...base, images: newImages});
                else
                    this.store.updateDescription({...base, images: newImages});
            }
        });

        this.bus.on(ModalEvents.EditableIFrame.Confirmed, ({data, context}) => {
            if (context.type === ProjectEvents.Request.IFrame.Edit)
                this.store.updateProject({id: context.id, liveMap: data});
        });

        this.bus.on(ModalEvents.Project.Confirmed, (data) => {
            if (data.id)
                this.store.updateProject(data);
            else
                this.store.createProject(data);
        });

        this.bus.on(ModalEvents.ProjectDetail.Confirmed, (data) => {
            if (data.id)
                this.store.updateDetail(data);
            else
                this.store.createDetail(data);
        });
    }

    async load() {
        await this.store.load();
    }

    onError(type, error) {
        if (type === ModelErrorType.Load)
            this.retryLoad();

        this.bus.emit(PopupEvents.Message.Err.Show, error);
    }

    retryLoad() {
        this.retryTimer.start(() => {
            this.bus.emit(ProjectEvents.Clear);
            this.load();
        });
    }
}