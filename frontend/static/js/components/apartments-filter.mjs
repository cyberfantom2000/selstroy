import { SearchEvents } from "../core/events.mjs";
import { apartmentTypeLabel } from "../apartment/type.mjs";
import { Timer } from "../utils/timer.mjs";


const MILLION = 1_000_000;
const COST_STEP = 0.1;
const LIVE_SEARCH_DELAY_MS = 500;


function toMillions(value) {
    return value === null || value === undefined ? null : value / MILLION;
}


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


function apartmentsWord(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11)
        return 'квартиру';

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
        return 'квартиры';

    return 'квартир';
}


class Chip {
    constructor(template, type, value) {
        this.element = template;

        this.input = template.querySelector('input');
        this.input.value = value;

        template.querySelector('span').textContent = type;
    }

    value() {
        return Number(this.input.value);
    }

    checked() {
        return this.input.checked;
    }

    setChecked(checked) {
        this.input.checked = checked;
    }
}


class SearchButton {
    constructor(element) {
        this.element = element;
        this.label = element.querySelector('[name="apply-label"]');
        this.spinner = element.querySelector('[name="apply-spinner"]');
        this.loading = false;
        this.count = null;

        this.onclick = null;
        this.element.onclick = () => { if (this.onclick) this.onclick() };

        this.render();
    }

    setLoading(loading) {
        this.loading = loading;
        this.render();
    }

    setCount(count) {
        this.count = count;
        this.render();
    }

    render() {
        this.element.disabled = this.loading || this.count === null || this.count === 0;
        this.spinner.classList.toggle('hidden', !this.loading);

        if (this.loading) {
            this.label.textContent = 'Ищем...';
            return;
        }

        if (this.count === null) {
            this.label.textContent = 'Показать квартиры';
            return;
        }

        this.label.textContent = `Показать ${this.count} ${apartmentsWord(this.count)}`;
    }
}


class CostRange {
    constructor(element) {
        this.element = element;
        this.minInput = element.querySelector('[name="cost-min-input"]');
        this.maxInput = element.querySelector('[name="cost-max-input"]');
        this.minRange = element.querySelector('[name="cost-min-range"]');
        this.maxRange = element.querySelector('[name="cost-max-range"]');
        this.track = element.querySelector('[name="cost-track"]');
        
        this.onchange = null;

        this.limitMinM = null;
        this.limitMaxM = null;
        this.midM = null;

        this.minRange.oninput = () => {
            const value = Number(this.minRange.value);
            this.minInput.value = value <= this.limitMinM ? '' : value;
            this.updateTrack();
            this.changed();
        };

        this.maxRange.oninput = () => {
            const value = Number(this.maxRange.value);
            this.maxInput.value = value >= this.limitMaxM ? '' : value;
            this.updateTrack();
            this.changed();
        };

        this.minInput.oninput = () => {
            const value = this.readInput(this.minInput);
            this.minRange.value = value === null ? this.limitMinM : clamp(value, this.limitMinM, this.midM);
            this.updateTrack();
            this.changed();
        };

        this.maxInput.oninput = () => {
            const value = this.readInput(this.maxInput);
            this.maxRange.value = value === null ? this.limitMaxM : clamp(value, this.midM, this.limitMaxM);
            this.updateTrack();
            this.changed();
        };

        this.minInput.onblur = () => this.normalizeInput(this.minInput, true);
        this.maxInput.onblur = () => this.normalizeInput(this.maxInput, false);
    }

    update(costMin, costMax) {
        const hasCost = costMin !== null && 
                        costMin !== undefined && 
                        costMax !== null && 
                        costMax !== undefined;

        this.element.classList.toggle('hidden', !hasCost);

        if (!hasCost) {
            this.limitMinM = null;
            this.limitMaxM = null;
            this.midM = null;
            return;
        }

        this.limitMinM = toMillions(costMin);
        this.limitMaxM = Math.max(toMillions(costMax), this.limitMinM + COST_STEP);
        this.midM = Number(
            (Math.round(((this.limitMinM + this.limitMaxM) / 2) / COST_STEP) * COST_STEP).toFixed(2)
        );

        this.configureControl(this.minInput, this.limitMinM, this.midM);
        this.configureControl(this.maxInput, this.midM, this.limitMaxM);
        this.configureControl(this.minRange, this.limitMinM, this.midM);
        this.configureControl(this.maxRange, this.midM, this.limitMaxM);

        this.minInput.placeholder = this.limitMinM;
        this.maxInput.placeholder = this.limitMaxM;

        this.setValues(null, null);
    }

    setValues(costMin, costMax) {
        if (this.midM === null)
            return;

        const hasMin = costMin !== null && costMin !== undefined;
        const hasMax = costMax !== null && costMax !== undefined;

        this.minInput.value = hasMin ? costMin / MILLION : '';
        this.maxInput.value = hasMax ? costMax / MILLION : '';
        this.minRange.value = hasMin ? clamp(costMin / MILLION, this.limitMinM, this.midM) : this.limitMinM;
        this.maxRange.value = hasMax ? clamp(costMax / MILLION, this.midM, this.limitMaxM) : this.limitMaxM;

        this.updateTrack();
    }

    values() {
        return {
            costMin: this.readValue(this.minInput, true),
            costMax: this.readValue(this.maxInput, false),
        };
    }

    reset() {
        this.setValues(null, null);
    }

    configureControl(control, min, max) {
        control.min = min;
        control.max = max;
        control.step = COST_STEP;
    }

    normalizeInput(input, isMin) {
        if (this.midM === null) {
            input.value = '';
            return;
        }

        const value = this.readInput(input);
        const limit = isMin ? this.limitMinM : this.limitMaxM;
        const range = isMin ? this.minRange : this.maxRange;

        if (value === null) {
            input.value = '';
            range.value = limit;
            this.updateTrack();
            return;
        }

        const [min, max] = isMin ? [this.limitMinM, this.midM] : [this.midM, this.limitMaxM];
        const clamped = clamp(value, min, max);
        const atLimit = isMin ? clamped <= this.limitMinM : clamped >= this.limitMaxM;

        input.value = atLimit ? '' : clamped;
        range.value = clamped;
        this.updateTrack();
    }

    updateTrack() {
        if (this.midM === null || !this.track)
            return;

        const minValue = this.readInput(this.minInput) ?? this.limitMinM;
        const maxValue = this.readInput(this.maxInput) ?? this.limitMaxM;

        const minM = clamp(minValue, this.limitMinM, this.midM);
        const maxM = clamp(maxValue, this.midM, this.limitMaxM);

        const leftRange = this.midM - this.limitMinM;
        const rightRange = this.limitMaxM - this.midM;

        const leftPercent = leftRange > 0 ? ((minM - this.limitMinM) / leftRange) * 50 : 0;
        const rightPercent = rightRange > 0 ? 50 + ((maxM - this.midM) / rightRange) * 50 : 100;

        this.track.style.left = `${leftPercent}%`;
        this.track.style.width = `${Math.max(rightPercent - leftPercent, 0)}%`;
    }

    readInput(input) {
        const raw = input.value.trim();
        if (raw === '')
            return null;

        const value = Number(raw);
        return Number.isFinite(value) ? value : null;
    }

    readValue(input, isMin) {
        if (this.midM === null)
            return null;

        const value = this.readInput(input);
        if (value === null)
            return null;

        if (isMin) {
            const clamped = clamp(value, this.limitMinM, this.midM);
            return clamped <= this.limitMinM ? null : Math.round(clamped * MILLION);
        }

        const clamped = clamp(value, this.midM, this.limitMaxM);
        return clamped >= this.limitMaxM ? null : Math.round(clamped * MILLION);
    }

    changed() {
        if (this.onchange)
            this.onchange();
    }
}


export class ApartmentsFilter {
    constructor({container, registry, bus}) {
        this.registry = registry;
        this.bus = bus;

        this.element = registry.getTemplate('apartments-filter-template');
        this.typesBlock = this.element.querySelector('[name="types-block"]');
        this.typesContainer = this.element.querySelector('[name="types"]');

        this.costRange = new CostRange(this.element.querySelector('[name="cost-block"]'));
        this.costRange.onchange = () => this.onChanged();

        this.searchButton = new SearchButton(this.element.querySelector('[name="apply-button"]'));

        this.resetButton = this.element.querySelector('[name="reset-button"]');
        this.resetButton.onclick = () => this.reset();

        this.chips = [];
        this.searchTimer = new Timer({delay: LIVE_SEARCH_DELAY_MS, singleshot: true});

        this.typesContainer.addEventListener('change', () => this.onChanged());

        this.bus.on(SearchEvents.Filters, (projectId, filters) => this.update(filters));
        this.bus.on(SearchEvents.Changed, (sender, filters) => { if (sender !== this) this.applyState(filters); });
        this.bus.on(SearchEvents.Result, (projectId, apartments) => this.handleResult(projectId, apartments));
        this.bus.on(SearchEvents.Loading, (loading) => {
            this.searchButton.setLoading(loading);
            this.resetButton.disabled = loading;
        });

        this.container = container;
        this.container.appendChild(this.element);
    }

    handleResult(projectId, apartments) {
        this.searchButton.setCount(apartments.length);
        this.searchButton.onclick = () => this.bus.emit(SearchEvents.Apply, projectId, apartments);
    }

    onChanged() {
        this.bus.emit(SearchEvents.Changed, this, this.activeFilters());
        this.scheduleSearch();
    }

    applyState(filters = {}) {
        this.syncTypes(filters.types ?? []);
        this.costRange.setValues(filters.costMin, filters.costMax);
    }

    syncTypes(types) {
        const selected = new Set(types);

        for (const chip of this.chips)
            chip.setChecked(selected.has(chip.value()));
    }

    update(filters = {}) {
        this.updateTypes(filters.types ?? []);
        this.costRange.update(filters.costMin, filters.costMax);
    }

    updateTypes(types) {
        this.chips = [];
        this.typesContainer.replaceChildren();

        for (const type of types) {
            const chip = new Chip(
                this.registry.getTemplate('apartments-filter-type-template'),
                apartmentTypeLabel(type),
                type
            );

            this.typesContainer.appendChild(chip.element);
            this.chips.push(chip);
        }

        this.typesBlock.classList.toggle('hidden', types.length === 0);
    }

    scheduleSearch() {
        this.searchTimer.stop();
        this.searchTimer.start(() => {
            this.bus.emit(SearchEvents.Request, this.activeFilters());
        });
    }

    activeFilters() {
        const filters = {};

        const types = this.chips
            .filter(chip => chip.checked())
            .map(chip => chip.value());

        if (types.length > 0)
            filters.types = types;

        const { costMin, costMax } = this.costRange.values();

        if (costMin !== null)
            filters.costMin = costMin;

        if (costMax !== null)
            filters.costMax = costMax;

        return filters;
    }

    reset() {
        this.searchTimer.stop();

        for (const chip of this.chips)
            chip.setChecked(false);

        this.costRange.reset();
        this.searchButton.setCount(null);
        this.bus.emit(SearchEvents.Changed, this, {});
        this.bus.emit(SearchEvents.Request, {});
    }
}
