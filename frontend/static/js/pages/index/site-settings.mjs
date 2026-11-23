import { SiteSettingsEvents } from "../../core/events.mjs";


export class IndexSettings {
    constructor({registry, bus}) {
        this.element = registry.get('index-settings');
        this.image = this.element.querySelector('[name="hero-image"]');
        this.statistics = this.element.querySelectorAll('[data-statistic]');
        this.numberFormat = new Intl.NumberFormat('en-US');

        this.image.onload = () => {
            if (this.image.naturalWidth > 0)
                this.image.classList.remove('hidden');
        };
        this.image.onerror = () => this.image.classList.add('hidden');

        bus.on(SiteSettingsEvents.Update, data => this.update(data));
    }

    update(data) {
        for (const element of this.statistics)
            element.textContent = this.numberFormat.format(data[element.dataset.statistic]);

        this.image.classList.add('hidden');
        if (data.heroImage)
            this.image.src = data.heroImage.url;
        else
            this.image.removeAttribute('src');
    }
}
