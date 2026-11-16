import { ModalEvents } from "../../core/events.mjs";
import { fitFrameContent } from "../../utils/iframe.mjs";
import { PANEL_CLASS, CONTENT_CLASS, WRAPPER_CLASS, TABS_ROW_CLASS, TABS_INNER_CLASS, TAB_INACTIVE, TAB_ACTIVE } from "../../components/toggled-images-style.mjs";


export class ProjectToggledImages {
    constructor({container, bus}) {
        this.container = container;
        this.bus = bus;
        this.tabs = [];
        this.panels = [];

        this.tabsRow = document.createElement('div');
        this.tabsRow.className = TABS_ROW_CLASS;
        this.tabsRowInner = document.createElement('div');
        this.tabsRowInner.className = TABS_INNER_CLASS;
        this.tabsRow.appendChild(this.tabsRowInner);

        this.panelsWrap = document.createElement('div');
        this.panelsWrap.className = 'flex flex-col w-full';

        const wrapper = document.createElement('div');
        wrapper.className = WRAPPER_CLASS;
        wrapper.appendChild(this.tabsRow);
        wrapper.appendChild(this.panelsWrap);

        this.container.appendChild(wrapper);
    }

    update(project) {
        this.clear();

        if (project.floorPlanUrl)
            this.addTab('Этаж', this.createFloorPanel(project.floorPlanUrl));

        if (project.masterPlaneImage?.url)
            this.addTab('Генплан', this.createImagePanel(project.masterPlaneImage.url));

        if (project.liveMapUrl)
            this.addTab('На карте', this.createMapPanel(project.liveMapUrl));

        this.container.classList.toggle('hidden', this.tabs.length === 0);

        if (this.tabs.length)
            this.select(0);
    }

    addTab(label, panel) {
        const tab = document.createElement('button');
        tab.textContent = label;
        const index = this.tabs.length;
        tab.onclick = () => this.select(index);

        this.tabsRowInner.appendChild(tab);
        this.tabs.push(tab);

        panel.classList.add('hidden');
        this.panelsWrap.appendChild(panel);
        this.panels.push(panel);
    }

    select(index) {
        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].className = i === index ? TAB_ACTIVE : TAB_INACTIVE;
            this.panels[i].classList.toggle('hidden', i !== index);
        }
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.className = PANEL_CLASS;

        const content = document.createElement('div');
        content.className = CONTENT_CLASS;
        panel.appendChild(content);

        return {panel, content};
    }

    createFloorPanel(url) {
        const {panel, content} = this.createPanel();
        panel.classList.add('cursor-pointer');
        panel.onclick = () => this.bus.emit(ModalEvents.FloorPlan.Open, url);

        const frame = document.createElement('iframe');
        frame.className = 'w-full h-full border-0 rounded-2xl bg-white pointer-events-none';
        frame.src = url;
        fitFrameContent(frame);
        content.appendChild(frame);

        const overlay = document.createElement('div');
        overlay.className = 'absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm text-white pointer-events-none';
        overlay.textContent = 'Развернуть';
        content.appendChild(overlay);

        return panel;
    }

    createImagePanel(url) {
        const {panel, content} = this.createPanel();

        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover cursor-pointer';
        img.src = url;
        img.onclick = () => this.bus.emit(ModalEvents.ImageGallery.Open, url, {navigable: false});

        content.appendChild(img);
        return panel;
    }

    createMapPanel(url) {
        const {panel, content} = this.createPanel();

        const frame = document.createElement('iframe');
        frame.className = 'w-full h-full border-0 rounded-2xl bg-white';
        frame.src = url;

        content.appendChild(frame);
        return panel;
    }

    clear() {
        for (const tab of this.tabs) tab.remove();
        for (const panel of this.panels) panel.remove();
        this.tabs = [];
        this.panels = [];
    }
}
