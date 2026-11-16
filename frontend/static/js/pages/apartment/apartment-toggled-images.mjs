import { ModalEvents } from "../../core/events.mjs";
import { fitFrameContent, onFrameLoad } from "../../utils/iframe.mjs";
import { selectFloorPlanApartment } from "../../utils/floor-plan.mjs";
import { PANEL_CLASS, CONTENT_CLASS, WRAPPER_CLASS, TABS_ROW_CLASS, TABS_INNER_CLASS, TAB_INACTIVE, TAB_ACTIVE } from "../../components/toggled-images-style.mjs";


export function apartmentImageTabs(apartment, project) {
    const entries = (apartment.images ?? []).filter(image => image.url).map(image => ({
        key: `image:${image.id}`, label: image.category, type: 'image', url: image.url,
    }));

    if (project?.floorPlanUrl)
        entries.push({key: 'floor', label: 'План этажа', type: 'floor', url: project.floorPlanUrl});

    if (project?.masterPlaneImage?.url)
        entries.push({key: 'master-plan', label: 'Генплан', type: 'image', url: project.masterPlaneImage.url});

    return entries;
}


export class ApartmentToggledImages {
    constructor({container, bus}) {
        this.container = container;
        this.bus = bus;
        this.entries = [];
        this.tabs = [];
        this.activeIndex = -1;
        this.apartmentUrl = null;

        this.tabsRow = document.createElement('div');
        this.tabsRow.className = `${TABS_ROW_CLASS} shrink-0`;
        this.tabsRow.setAttribute('role', 'group');
        this.tabsRow.setAttribute('aria-label', 'Изображения квартиры');
        this.tabsRowInner = document.createElement('div');
        this.tabsRowInner.className = TABS_INNER_CLASS;
        this.tabsRow.appendChild(this.tabsRowInner);

        this.panel = document.createElement('div');
        this.panel.className = `${PANEL_CLASS} lg:grow lg:min-h-[400px]`;
        this.panelContent = document.createElement('div');
        this.panelContent.className = CONTENT_CLASS;
        this.panel.appendChild(this.panelContent);

        const wrapper = document.createElement('div');
        wrapper.className = `${WRAPPER_CLASS} lg:p-0 lg:justify-start`;
        wrapper.appendChild(this.tabsRow);
        wrapper.appendChild(this.panel);
        this.container.appendChild(wrapper);
    }

    update(apartment, project) {
        const activeKey = this.entries[this.activeIndex]?.key;
        this.apartmentUrl = apartment.url;
        this.entries = apartmentImageTabs(apartment, project);
        this.tabsRowInner.replaceChildren();
        this.tabs = [];

        this.entries.forEach((entry, index) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.textContent = entry.label;
            tab.onclick = () => this.select(index);
            this.tabsRowInner.appendChild(tab);
            this.tabs.push(tab);
        });

        this.tabsRow.classList.toggle('hidden', this.entries.length === 0);
        this.select(Math.max(0, this.entries.findIndex(entry => entry.key === activeKey)));
    }

    select(index) {
        this.activeIndex = index;
        this.tabs.forEach((tab, i) => {
            tab.className = i === index ? TAB_ACTIVE : TAB_INACTIVE;
            tab.setAttribute('aria-pressed', i === index ? 'true' : 'false');
        });

        this.panelContent.replaceChildren();
        const entry = this.entries[index];
        if (!entry) {
            this.panelContent.appendChild(this.createPlaceholder('Изображения отсутствуют'));
            return;
        }

        if (entry.type === 'floor')
            this.showFloor(entry);
        else
            this.showImage(entry);
    }

    createPlaceholder(text) {
        const placeholder = document.createElement('div');
        placeholder.className = 'absolute inset-0 flex items-center justify-center p-4 text-center text-gray-700 dark:text-gray-300';
        placeholder.textContent = text;
        return placeholder;
    }

    showImage(entry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'relative block w-full h-full cursor-pointer';
        button.setAttribute('aria-label', `Увеличить: ${entry.label}`);
        button.onclick = () => this.bus.emit(ModalEvents.ImageGallery.Open, entry.url, {navigable: false});

        const placeholder = this.createPlaceholder('Загрузка изображения…');
        const image = document.createElement('img');
        image.className = 'relative w-full h-full object-cover';
        image.alt = entry.label;
        image.onload = () => placeholder.remove();
        image.onerror = () => {
            button.disabled = true;
            button.replaceChildren(this.createPlaceholder('Не удалось загрузить изображение'));
        };
        image.src = entry.url;

        button.appendChild(placeholder);
        button.appendChild(image);
        this.panelContent.appendChild(button);
    }

    showFloor(entry) {
        const frame = document.createElement('iframe');
        frame.className = 'w-full h-full border-0 bg-white pointer-events-none';
        frame.title = entry.label;
        frame.tabIndex = -1;
        fitFrameContent(frame);
        const apartmentUrl = this.apartmentUrl;
        onFrameLoad(frame, doc => selectFloorPlanApartment(doc, apartmentUrl));
        frame.src = entry.url;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'absolute inset-0 w-full h-full cursor-pointer';
        button.setAttribute('aria-label', 'Развернуть план этажа');
        button.onclick = () => this.bus.emit(ModalEvents.FloorPlan.Open, entry.url, apartmentUrl);

        const badge = document.createElement('span');
        badge.className = 'absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white';
        badge.textContent = 'Развернуть';
        button.appendChild(badge);

        this.panelContent.appendChild(frame);
        this.panelContent.appendChild(button);
    }
}
