import { Timer } from "../../utils/timer.mjs";
import { ProjectEvents, ModalEvents, PopupEvents, ModelErrorType, ProjectFileType, ProjectDetailType } from "../../core/events.mjs";


const fileModalTitles = {
    [ProjectFileType.Preview]: 'Изменить превью',
    [ProjectFileType.MasterPlan]: 'Изменить генплан',
    [ProjectFileType.FloorPlan]: 'Изменить файл этажа',
    [ProjectFileType.LiveMap]: 'Изменить файл карты',
    [ProjectFileType.Detail]: 'Изменить изображение',
    [ProjectFileType.Description]: 'Изменить изображение',
};


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

        /* Project file events */
        this.bus.on(ProjectEvents.Request.File.Open, ({url, type}) => {
            const isHtml = type === ProjectFileType.FloorPlan || type === ProjectFileType.LiveMap;
            this.bus.emit(isHtml ? ModalEvents.HtmlView.Open : ModalEvents.ImageView.Open, url);
        });

        this.bus.on(ProjectEvents.Request.File.Create, ({context}) => {
            this.bus.emit(ModalEvents.EditableFile.Open, {
                title: 'Добавить изображение',
                context: context,
                data: {}
            });
        });

        this.bus.on(ProjectEvents.Request.File.Edit, ({context, data}) => {
            this.bus.emit(ModalEvents.EditableFile.Open, {
                title: fileModalTitles[context.type] ?? 'Изменить файл',
                context: {...context, oldImageId: data ? data.id : null},
                data: data
            });
        });

        this.bus.on(ProjectEvents.Request.File.Remove, ({context, data}) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: context.type,
                context: context,
                style: 'danger',
                text: 'Вы уверены что хотите удалить файл?',
                data: data
            });
        });

        /* Project details events */
        this.bus.on(ProjectEvents.Request.ProjectDetail.Create, ({projectId}) => {
            this.bus.emit(ModalEvents.ProjectDetail.Open, {
                title: 'Создать описание проекта',
                data: { projectId: projectId }
            });
        });

        this.bus.on(ProjectEvents.Request.ProjectDetail.Edit, (data) => {
            this.bus.emit(ModalEvents.ProjectDetail.Open, {
                title: 'Изменить описание проекта',
                data: data
            });
        });

        this.bus.on(ProjectEvents.Request.ProjectDetail.Remove, (data) => {
            this.bus.emit(ModalEvents.Confirm.Open, {
                type: ProjectEvents.Request.ProjectDetail.Remove,
                style: 'danger',
                text: `Вы уверены что хотите удалить описание проекта?`,
                data: data
            });
        });

        /* Modal events */
        this.bus.on(ModalEvents.Confirm.Confirmed, (payload) => {
            if (payload.type === ProjectFileType.Detail || payload.type === ProjectFileType.Description) {
                const images = payload.context.images.filter(el => el.id !== payload.data.id);
                if (payload.type === ProjectFileType.Detail)
                    this.store.updateDetail({id: payload.context.id, images: images});
                else
                    this.store.updateDescription({id: payload.context.id, images: images});
            }

            if (payload.type === ProjectFileType.Preview)
                this.store.updateProject({id: payload.context.id, previewImage: null});

            if (payload.type === ProjectFileType.MasterPlan)
                this.store.updateProject({id: payload.context.id, masterPlaneImage: null});

            if (payload.type === ProjectFileType.FloorPlan)
                this.store.updateProject({id: payload.context.id, floorPlan: null});

            if (payload.type === ProjectFileType.LiveMap)
                this.store.updateProject({id: payload.context.id, liveMap: null});

            if (payload.type === ProjectEvents.Request.Project.Remove)
                this.store.removeProject(payload.data.id);

            if (payload.type === ProjectEvents.Request.ProjectDetail.Remove)
                this.store.removeDetail(payload.data.id);
        });

        this.bus.on(ModalEvents.EditableFile.Confirmed, ({data, context}) => {
            const base = {id: context.id};

            if (context.type === ProjectFileType.Preview)
                this.store.updateProject({...base, previewImage: data});

            if (context.type === ProjectFileType.MasterPlan)
                this.store.updateProject({...base, masterPlaneImage: data});

            if (context.type === ProjectFileType.FloorPlan)
                this.store.updateProject({...base, floorPlan: data});

            if (context.type === ProjectFileType.LiveMap)
                this.store.updateProject({...base, liveMap: data});

            if (context.type === ProjectFileType.Detail || context.type === ProjectFileType.Description) {
                let newImages = [];
                if (context.request === ProjectEvents.Request.File.Create)
                    newImages = [...context.images, data];

                if (context.request === ProjectEvents.Request.File.Edit) {
                    const index = context.images.findIndex(el => el.id === context.oldImageId);
                    newImages = [...context.images.slice(0, index), data, ...context.images.slice(index + 1)];
                }

                if (context.type === ProjectFileType.Detail)
                    this.store.updateDetail({...base, images: newImages});
                else
                    this.store.updateDescription({...base, images: newImages});
            }
        });

        this.bus.on(ModalEvents.Project.Confirmed, (data) => {
            if (data.id)
                this.store.updateProject(data);
            else
                this.store.createProject(data);
        });

        this.bus.on(ModalEvents.ProjectDetail.Confirmed, (data) => {
            if (data.id) {
                if (data.type === ProjectDetailType.Description)
                    this.store.updateDescription(data);
                else
                    this.store.updateDetail(data);
            } else {
                this.store.createDetail(data);
            }
        });
    }

    async load() {
        await this.store.load({includeDrafts: true});
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
