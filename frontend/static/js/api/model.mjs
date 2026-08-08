export async function extractErrorMessage(resp) {
    const base = `HTTP Error: ${resp.status} ${resp.statusText}`;

    if (isJsonContent(resp)) {
        try {
            const reply = await resp.json();

            if (reply?.detail) {
                if (Array.isArray(reply.detail)) {
                    const details = reply.detail
                        .map(err => {
                            const loc = err.loc ? err.loc.join('.') : 'unknown';
                            return `Message: ${err.msg}, Type: ${err.type}, Field: ${loc}`;
                        })
                        .join(' | ');

                    return `${base}, ${details}`;
                }

                if (typeof reply.detail === 'string')
                    return `${base}, Message: ${reply.detail}`;

                return `${base}, Details: ${JSON.stringify(reply.detail)}`;
            }
        } catch (err) {
            console.log(err);
        }
    }

    return `${base}, Unknown error`;
    
}


export function isJsonContent(resp) {
    const contentType = resp.headers.get('content-type');
    return contentType && contentType.includes('application/json');
}


export async function requestModels(baseUrl, limit=100, offset=0, fields=[]){
    let url = baseUrl + '?limit=' + limit + '&offset=' + offset;
    if(fields.length)
        url += '&fields=' + fields.join(',');

    const resp = await fetch(url,{
        method: 'GET',
        headers: {'accept': 'application/json'}
    });

    if (!resp.ok) {
        const error = await extractErrorMessage(resp);
        throw new Error(error);
    }

    try {
        return await resp.json();
    } catch (err) {
        console.error('Failed to parse server response:', err);
        throw new Error('Failed to parse server response');
    }
}

export async function requestAllModels(requestFunction, fields=[]){
    let limit = 100;
    let offset = 0;
    let result = [];
    while(true){
        const elements = await requestFunction(limit, offset, fields);
        result = result.concat(elements);

        if(elements.length < limit)
            break;

        offset += limit;
    }

    return result;
}

export async function removeModel(baseUrl, id){
    const resp = await fetch(baseUrl + '/' + id, {
        method: "DELETE",
        headers: { 'accept': 'application/json' }
    });

    if (!resp.ok) {
        const error = await extractErrorMessage(resp);
        throw new Error(error);
    }

    try {
        return await resp.json();
    } catch (err) {
        console.error('Failed to parse server response:', err);
        throw new Error('Failed to parse server response');
    }
}

export async function createModel(baseUrl, data){
    const resp = await fetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'Content-type': 'application/json'
        }
    });

    if (!resp.ok) {
        const error = await extractErrorMessage(resp);
        throw new Error(error);
    }

    try {
        return await resp.json();
    } catch (err) {
        console.error('Failed to parse server response:', err);
        throw new Error('Failed to parse server response');
    }
}

export async function updateModel(baseUrl, data){
    const resp = await fetch(baseUrl, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'Content-type': 'application/json'
        }
    });

    if (!resp.ok) {
        const error = await extractErrorMessage(resp);
        throw new Error(error);
    }

    try {
        return await resp.json();
    } catch (err) {
        console.error('Failed to parse server response:', err);
        throw new Error('Failed to parse server response');
    }
}

export async function queryModels(baseUrl, filters, fields) {
    let url = baseUrl + '/query';
    if (fields)
    {
        const commaSepFields = fields.join(',');
        url += '?fields=' + commaSepFields;
    }
    
    const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify(filters),
        headers: {
            'accept': 'application/json',
            'Content-type': 'application/json'
        }
    });

    if (!resp.ok) {
        const error = await extractErrorMessage(resp);
        throw new Error(error);
    }

    try {
        return await resp.json();
    } catch (err) {
        console.error('Failed to parse server response:', err);
        throw new Error('Failed to parse server response');
    }
}