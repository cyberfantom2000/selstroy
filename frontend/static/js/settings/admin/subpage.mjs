import { Page } from "../../pages/page.mjs";
import { EditableImage } from "../../components/editable-image.mjs";
import { SiteSettingsEvents, ModalEvents } from "../../core/events.mjs";


export class AdminSettingsSubpage extends Page {
    constructor({registry, bus}) {
        super({pageContainer: registry.get('settings-subpage')});
        this.bus = bus;
        this.settings = null;
        this.operation = null;
        this.statisticsDirty = false;

        this.form = this.pageContainer.querySelector('[name="statistics-form"]');
        this.statisticsControls = this.form.querySelector('fieldset');
        this.imageControls = this.pageContainer.querySelector('[name="image-controls"]');
        this.status = this.pageContainer.querySelector('[name="status"]');
        this.error = this.pageContainer.querySelector('[name="error"]');
        this.retryButton = this.pageContainer.querySelector('[name="retry-button"]');
        this.imagePlaceholder = this.pageContainer.querySelector('[name="image-placeholder"]');
        this.fields = Object.fromEntries(
            [...this.form.querySelectorAll('input')].map(input => [input.name, input])
        );

        this.heroImage = new EditableImage(this.pageContainer.querySelector('[name="hero-image"]'));
        this.heroImage.editClicked = () => this.bus.emit(SiteSettingsEvents.Request.EditImage);
        this.heroImage.removeClicked = () => this.bus.emit(SiteSettingsEvents.Request.RemoveImage);
        this.heroImage.clicked = url => this.bus.emit(ModalEvents.ImageView.Open, url);
        this.heroImage.image.onerror = () => this.showImageError();

        this.retryButton.onclick = () => this.bus.emit(SiteSettingsEvents.Request.Load);
        this.form.addEventListener('input', () => { this.statisticsDirty = true; });
        this.form.addEventListener('submit', event => {
            event.preventDefault();
            if (this.statisticsControls.disabled || !this.form.reportValidity()) return;

            const data = Object.fromEntries(
                Object.entries(this.fields).map(([name, input]) => [name, input.valueAsNumber])
            );
            this.bus.emit(SiteSettingsEvents.Request.SaveStatistics, data);
        });

        this.bus.on(SiteSettingsEvents.Update, data => this.update(data));
        this.bus.on(SiteSettingsEvents.State, state => this.setState(state));
    }

    update(data) {
        const updateStatistics = !this.settings || !this.statisticsDirty || this.operation === 'statistics';
        this.settings = data;
        this.heroImage.update(data.heroImage);
        this.heroImage.image.classList.toggle('hidden', !data.heroImage);
        this.imagePlaceholder.classList.toggle('hidden', !!data.heroImage);
        this.imagePlaceholder.textContent = 'Изображение не задано';

        if (updateStatistics) {
            for (const [name, input] of Object.entries(this.fields))
                input.value = data[name];

            this.statisticsDirty = false;
        }
    }

    setState({busy, operation, message, error}) {
        this.operation = operation;
        this.pageContainer.setAttribute('aria-busy', String(busy));
        this.imageControls.disabled = busy || !this.settings;
        this.statisticsControls.disabled = busy || !this.settings;
        this.retryButton.disabled = busy;
        this.retryButton.classList.toggle('hidden', busy || !!this.settings || !error);
        this.status.textContent = message;
        this.error.textContent = error ?? '';
        this.error.classList.toggle('hidden', !error);
    }

    showImageError() {
        this.heroImage.image.classList.add('hidden');
        this.imagePlaceholder.classList.remove('hidden');
        this.imagePlaceholder.textContent = 'Не удалось загрузить изображение';
    }
}
