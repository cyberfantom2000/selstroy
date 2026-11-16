export function resolveFloorPlanUrl(path, origin) {
    return new URL(`/${path.replace(/^\/+/, '')}`, origin).href;
}


export function selectFloorPlanApartment(doc, apartmentUrl) {
    const path = apartmentUrl?.replace(/\/+$/, '');
    for (const group of doc.querySelectorAll('g[id^="app "]')) {
        const selected = [...group.querySelectorAll('[id^="/apartments/"], [id^="apartments/"]')]
            .some(element => `/${element.id.replace(/^\/+|\/+$/g, '')}` === path);
        group.classList.toggle('show', selected);
    }
}
