import { SiteSettingsEvents } from "../../core/events.mjs";


export class IndexSettings {
    constructor({registry, bus}) {
        this.element = registry.get('index-settings');
        this.image = this.element.querySelector('[name="hero-image"]');
        this.overlay = this.element.querySelector('[name="hero-overlay"]');
        this.statistics = this.element.querySelectorAll('[data-statistic]');
        this.numberFormat = new Intl.NumberFormat('en-US');

        this.image.onload = () => this.setImageVisible(this.image.naturalWidth > 0);
        this.image.onerror = () => this.setImageVisible(false);

        bus.on(SiteSettingsEvents.Update, data => this.update(data));
    }

    update(data) {
        for (const element of this.statistics)
            element.textContent = this.numberFormat.format(data[element.dataset.statistic]);

        this.setImageVisible(false);
        if (data.heroImage)
            this.image.src = data.heroImage.url;
        else
            this.image.removeAttribute('src');
    }

    setImageVisible(visible) {
        this.image.classList.toggle('hidden', !visible);
        this.overlay.classList.toggle('hidden', !visible);
    }
}
