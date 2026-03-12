import { requestModels, requestAllModels, removeModel } from "./model.mjs";
import { mediaUrl } from "./base-urls.mjs";


export async function requestFilesDescriptions(limit=100, offset=0, fields=[]) {
    return await requestModels(mediaUrl, limit, offset, fields);
}

export async function requestAllFilesDescriptions(fields=[]) {
    return await requestAllModels(requestFilesDescriptions, fields);
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const resp = await fetch(mediaUrl, {
        method: 'POST',
        body: formData
    });

    const reply = await resp.json();

    if (!resp.ok)
        throw new Error(reply.detail);

    return reply;
}

export async function deleteFile(id) {
    return await removeModel(mediaUrl, id);
}

export async function downloadFile(url, filename) {
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