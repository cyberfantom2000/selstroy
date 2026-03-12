import { mediaUrl } from "../api/base-urls.mjs";
import { Timer } from "../utils/timer.mjs";


class ProjectPreviewTitle {
    constructor(data, element) {
        this.title = element.querySelector('[name="title"]');
        this.extra_title = element.querySelector('[name="extra-title"]');

        this.title.text = data.title;
        this.extra_title.text = 'Сдача: ' + data.release_date;
    }
}


class ProjectPreviewImage {
    constructor(data, element) {
        this.image = element.querySelector('img');
        this.image.src = `${mediaUrl}/${data.preview_image.id}`;
    }
}


class ProjectPreviewDescription {
    constructor(data, item, row_template) {
        this.container = item.querySelector('[name="description-container"]');
        
        const status = row_template.content.cloneNode(true);
        status.text = 'Статус: ' + data.sale_status;
        this.container.appendChild(status);

        const square = row_template.content.cloneNode(true);
        square.text = 'Площадь: от ${data.square_min} до ${data.square_max} м²';
        this.container.appendChild(status);
    }
}


class ProjectItem {
    constructor(data, item_template, description_row_template) {
        this.element = item_template.content.cloneNode(true);

        this.title = new ProjectPreviewTitle(data, this.element);
        this.image = new ProjectPreviewImage(data, this.element);
        this.description = new ProjectPreviewDescription(data, this.element, description_row_template);
    }
}


export class ProjectsPreviewConfig {
    constructor({async_loader, retry_interval_secs = 10}) {
        this.async_loader = async_loader;
        this.retry_interval_secs = retry_interval_secs;
    }
}


export class ProjectsPreview {
    constructor({config, container_id}) {
        this.main_container = document.getElementById(container_id);
        this.config = config;

        this.item_template = document.getElementById('project-preview-item-template');
        this.description_row_template = document.getElementById('project-preview-description-row-template');

        this.items = [];
        this.retry_timer = new Timer(this.config.retry_interval_secs * 1000, true);

        this.build();
    }

    async build() {
        try {
            const items = await this.config.async_loader();
            for (const item of items) {
                const projectItem = new ProjectItem(item, this.item_template, this.description_row_template);
                // TDOO добавить плейсхолдеры с заменой
                // this.replace_placeholder_or_add(projectItem);
                this.items.push(projectItem);
                this.main_container.appendChild(projectItem.element);
            }
        } catch (err) {
            // TODO post message
            this.retry_timer.start(() => { this.retry(); });
        }
    }

    clear() {
        this.retry_timer.stop();

        while(this.main_container.firstChild)
            this.main_container.removeChild(this.main_container.firstChild);

        this.items = []
    }

    retry() {
        this.clear();
        this.build();
    }
}