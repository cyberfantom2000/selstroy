import { mediaUrl } from "../api/base-urls.mjs";
import { MediaEvents, MediaErrorType, PopupEvents, ModelErrorType } from "../core/events.mjs";


function isImageExt(ext) {
    return ['.png', '.jpg', '.jpeg'].includes(ext);
}


function normalize(data) {
    return {
        id: data.id,
        name: data.name,
        ext: data.ext,
        isImage: isImageExt(data.ext),
        url: `${mediaUrl}/${data.id}`,
        size: data.size,
        fullName: `${data.name}.${data.ext}`,
        absoluteUrl: window.location.origin + `${mediaUrl}/${data.id}`
    };
}


export class MediaStore {
    constructor({api, bus}) {
        this.api = api;
        this.bus = bus;
        this.descriptors = [];
        this.requestId = 0;
    }

    async load() {
        const requestId = ++this.requestId;
        try {
            const data = await this.api.requestAllFilesDescriptors();
            if (requestId !== this.requestId) return;

            this.descriptors = data.map(normalize);
            this.bus.emit(MediaEvents.Update, this.descriptors);
        } catch (err) {
            if (requestId !== this.requestId) return;
            this.bus.emit(MediaEvents.Error, ModelErrorType.Load, err);
            this.bus.emit(PopupEvents.Message.Err.Show, err);
        }
    }

    async upload(file) {
        try {
            const descriptor = normalize(await this.api.uploadFile(file));
            this.descriptors = [...this.descriptors, descriptor];
            this.bus.emit(MediaEvents.Update, this.descriptors);
        } catch (err) {
            this.bus.emit(MediaEvents.Error, MediaErrorType.Upload, err);
            this.bus.emit(PopupEvents.Message.Err.Show, err);
        }
    }

    async download(url, filename) {
        try {
            await this.api.downloadFile(url, filename);
            // this.bus.emit('media:download:success');
        } catch (err) {
            this.bus.emit(MediaEvents.Error, MediaErrorType.Download, err);
            this.bus.emit(PopupEvents.Message.Err.Show, err);
        }
    }

    async remove(id) {
        try {
            await this.api.deleteFile(id);
            this.descriptors = this.descriptors.filter(el => el.id !== id);
            this.bus.emit(MediaEvents.Update, this.descriptors);
        } catch (err) {
            this.bus.emit(MediaEvents.Error, ModelErrorType.Remove, err);
            this.bus.emit(PopupEvents.Message.Err.Show, err);
        }
    }
}