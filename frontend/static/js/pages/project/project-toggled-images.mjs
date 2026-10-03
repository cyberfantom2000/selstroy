import { ModalEvents } from "../../core/events.mjs";


const PANEL_CLASS = 'w-full h-[300px] md:h-[400px] bg-gray-300 dark:bg-gray-600 rounded-3xl rounded-tl-none p-2';
const CONTENT_CLASS = 'relative w-full h-full overflow-hidden rounded-2xl';
const TAB_INACTIVE = 'min-w-20 flex items-center justify-center rounded-2xl p-2 bg-gray-300 dark:bg-gray-600 hover:bg-primary-500 text-black dark:text-gray-300 hover:text-gray-200 transition';
const TAB_ACTIVE = 'min-w-20 flex items-center justify-center rounded-2xl p-2 bg-primary-500 text-gray-200 transition';


export class ProjectToggledImages {
    constructor({container, bus}) {
        this.container = container;
        this.bus = bus;
        this.tabs = [];
        this.panels = [];

        this.tabsRow = document.createElement('div');
        this.tabsRow.className = 'flex w-full justify-start';
        this.tabsRowInner = document.createElement('div');
        this.tabsRowInner.className = 'flex flex-row flex-wrap bg-gray-300 dark:bg-gray-600 rounded-2xl rounded-br-none rounded-bl-none p-[3px]';
        this.tabsRow.appendChild(this.tabsRowInner);

        this.panelsWrap = document.createElement('div');
        this.panelsWrap.className = 'flex flex-col w-full';

        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-1 flex-col items-center justify-center p-4';
        wrapper.appendChild(this.tabsRow);
        wrapper.appendChild(this.panelsWrap);

        this.container.appendChild(wrapper);
    }

    update(project) {
        this.clear();

        this.addTab('Этаж', this.createSvgPanel(project.floorSvg));
        this.addTab('Генплан', this.createImagePanel(project.masterPlaneImage?.url));
        this.addTab('На карте', this.createMapPanel(project.liveMap));

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

    createSvgPanel(svg) {
        const {panel, content} = this.createPanel();
        content.innerHTML = svg ?? '';

        const svgEl = content.querySelector('svg');
        if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';
        }

        return panel;
    }

    createImagePanel(url) {
        const {panel, content} = this.createPanel();

        const img = document.createElement('img');
        img.className = 'w-full h-full object-cover cursor-pointer';
        img.src = url ?? '';
        img.onclick = () => this.bus.emit(ModalEvents.ImageView.Open, url);

        content.appendChild(img);
        return panel;
    }

    createMapPanel(html) {
        const {panel, content} = this.createPanel();
        content.innerHTML = html ?? '';

        const iframe = content.querySelector('iframe');
        if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.classList.add('rounded-xl');
        }

        return panel;
    }

    clear() {
        for (const tab of this.tabs) tab.remove();
        for (const panel of this.panels) panel.remove();
        this.tabs = [];
        this.panels = [];
    }
}
