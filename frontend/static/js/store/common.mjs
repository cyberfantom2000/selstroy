import { mediaUrl } from "../api/base-urls.mjs";


export function normalizeFile(data) {
    return {
        id: data.id,
        url: `${mediaUrl}/${data.id}`
    };
}

export function denormalize(data, bindings) {
    let result = {};
    for (const [from, to] of Object.entries(bindings)) {
        if (from in data)
            result[to] = data[from];
    }
    return result;
}
