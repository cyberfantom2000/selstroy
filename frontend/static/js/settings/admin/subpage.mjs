import { Page } from "../../pages/page.mjs";
import { EditableImage } from "../../components/editable-image.mjs";
import { SiteSettingsEvents, ModalEvents } from "../../core/events.mjs";


export class AdminSettingsSubpage extends Page {
    constructor({registry, bus}) {
        super({pageContainer: registry.get('settings-subpage')});
        this.bus = bus;
        this.loaded = false;
        this.operation = null;
        this.statisticsDirty = false;

        this.form = this.pageContainer.querySelector('[name="statistics-form"]');
        this.submitButton = this.form.querySelector('[type="submit"]');
        this.statisticsControls = this.form.querySelector('fieldset');
        this.imageControls = this.pageContainer.querySelector('[name="image-controls"]');
        this.fields = Object.fromEntries(
            [...this.form.querySelectorAll('input')].map(input => [input.name, input])
        );

        this.heroImage = new EditableImage(registry.getTemplate('editable-image-template'));
        this.heroImage.update(null);
        this.heroImage.hide();
        this.heroImage.editClicked = () => this.bus.emit(SiteSettingsEvents.Request.EditImage);
        this.heroImage.removeClicked = () => this.bus.emit(SiteSettingsEvents.Request.RemoveImage);
        this.heroImage.clicked = url => this.bus.emit(ModalEvents.ImageView.Open, url);
        this.heroImage.image.onerror = () => this.heroImage.hide();
        this.pageContainer.querySelector('[name="hero-image"]').appendChild(this.heroImage.element);

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
        const updateStatistics = !this.loaded || !this.statisticsDirty || this.operation === 'statistics';
        this.loaded = true;
        this.heroImage.update(data.heroImage);
        this.heroImage.hide(!data.heroImage);

        if (updateStatistics) {
            for (const [name, input] of Object.entries(this.fields))
                input.value = data[name];

            this.statisticsDirty = false;
        }
    }

    setState({busy, operation}) {
        this.operation = operation;
        this.pageContainer.setAttribute('aria-busy', String(busy));
        this.imageControls.disabled = busy || !this.loaded;
        this.statisticsControls.disabled = busy || !this.loaded;
        this.submitButton.disabled = busy || !this.loaded;
    }
}
