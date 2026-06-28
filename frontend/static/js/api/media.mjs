import { requestModels, requestAllModels, removeModel } from "./model.mjs";
import { ApiUrls } from "./base-urls.mjs";


export class MediaApi {
    async requestFilesDescriptors(limit=100, offset=0, fields=[]) {
        return await requestModels(ApiUrls.media, limit, offset, fields);
    }

    async requestAllFilesDescriptors(fields=[]) {
        return await requestAllModels(this.requestFilesDescriptors, fields);
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        const resp = await fetch(ApiUrls.media, {
            method: 'POST',
            body: formData
        });

        const reply = await resp.json();

        if (!resp.ok)
            throw new Error(reply.detail);

        return reply;
    }

    async downloadFile(url, filename) {
        const response = await fetch(url);
        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(blobUrl);
    }

    async removeFile(id) {
        return await removeModel(ApiUrls.media, id);
    }
}