export function makeErrorMessage(resp, reply) {
    const base = `HTTP Error: ${resp.status} ${resp.statusText}`;

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

    return `${base}, Unknown error`;
}


export async function requestModels(baseUrl, limit=100, offset=0, fields=[]){
    let url = baseUrl + '?limit=' + limit + '&offset=' + offset;
    if(fields.length)
        url += '&fields=' + fields.join(',');

    const resp = await fetch(url,{
        method: 'GET',
        headers: {'accept': 'application/json'}
    });

    try {
        const reply = await resp.json();

        if (!resp.ok)
            throw new Error(makeErrorMessage(resp, reply));

       return reply;
    } catch (err) {
        console.error('Failed to parse server response:', err);
        if (resp.ok)
            throw new Error('Failed to parse server response');
        else
            throw new Error('Server error: ' + resp.status + '; ' + resp.statusText);
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

    const reply = await resp.json();

    if (!resp.ok)
        throw new Error(makeErrorMessage(resp, reply));
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

    const reply = await resp.json();

    if (!resp.ok)
        throw new Error(makeErrorMessage(resp, reply));

    return reply;
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

    const reply = await resp.json();

    if (!resp.ok)
        throw new Error(makeErrorMessage(resp, reply));

    return reply;
}

export async function queryModels(baseUrl, data) {
    const resp = await fetch(baseUrl + '/query', {
        method: "POST",
        body: JSON.stringify(data),
        headers:{
            'accept': 'application/json',
            'Content-type': 'application/json'
        }
    });

    const reply = await resp.json();

    if(!resp.ok)
        throw new Error(makeErrorMessage(resp, reply));

    return reply;
}