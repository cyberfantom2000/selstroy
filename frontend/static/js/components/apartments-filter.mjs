import { SearchEvents } from "../core/events.mjs";
import { apartmentTypeLabel } from "../apartment/type.mjs";


const MILLION = 1_000_000;
const COST_STEP = 0.1;


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


export class ApartmentsFilter {
    constructor({container, registry, bus}) {
        this.registry = registry;
        this.bus = bus;

        this.element = registry.getTemplate('apartments-filter-template');
        this.typesBlock = this.element.querySelector('[name="types-block"]');
        this.typesContainer = this.element.querySelector('[name="types"]');
        this.costBlock = this.element.querySelector('[name="cost-block"]');
        this.costMinInput = this.element.querySelector('[name="cost-min-input"]');
        this.costMaxInput = this.element.querySelector('[name="cost-max-input"]');
        this.costMinRange = this.element.querySelector('[name="cost-min-range"]');
        this.costMaxRange = this.element.querySelector('[name="cost-max-range"]');
        this.costTrack = this.element.querySelector('[name="cost-track"]');
        this.applyButton = this.element.querySelector('[name="apply-button"]');
        this.resetButton = this.element.querySelector('[name="reset-button"]');

        this.costLimitMinM = null;
        this.costLimitMaxM = null;
        this.costMidM = null;
        this.resultCount = null;
        this.loading = false;

        this.bindCostControls();
        this.bindActions();

        this.bus.on(SearchEvents.Filters, (projectId, filters) => this.update(filters));
        this.bus.on(SearchEvents.Result, (projectId, apartments) => this.setResultCount(apartments.length));
        this.bus.on(SearchEvents.Loading, (loading) => this.setLoading(loading));

        this.container = container;
        this.container.appendChild(this.element);
        this.updateButtonText();
    }

    update(filters = {}) {
        this.updateTypes(filters.types ?? []);
        this.updateCost(filters.costMin, filters.costMax);
    }

    updateTypes(types) {
        this.typesContainer.replaceChildren();

        for (const type of types) {
            const chip = this.registry.getTemplate('apartments-filter-type-template');
            chip.querySelector('span').textContent = apartmentTypeLabel(type);
            chip.querySelector('input').value = type;
            this.typesContainer.appendChild(chip);
        }

        this.typesBlock.classList.toggle('hidden', types.length === 0);
    }

    updateCost(costMin, costMax) {
        const hasCost = costMin !== null && 
                        costMin !== undefined && 
                        costMax !== null && 
                        costMax !== undefined;

        this.costBlock.classList.toggle('hidden', !hasCost);

        if (!hasCost) {
            this.costLimitMinM = null;
            this.costLimitMaxM = null;
            this.costMidM = null;
            return;
        }

        this.costLimitMinM = toMillions(costMin);
        this.costLimitMaxM = Math.max(toMillions(costMax), this.costLimitMinM + COST_STEP);
        this.costMidM = Number(
            (Math.round(((this.costLimitMinM + this.costLimitMaxM) / 2) / COST_STEP) * COST_STEP).toFixed(2)
        );

        this.configureCostControl(this.costMinInput, this.costLimitMinM, this.costMidM);
        this.configureCostControl(this.costMaxInput, this.costMidM, this.costLimitMaxM);
        this.configureCostControl(this.costMinRange, this.costLimitMinM, this.costMidM);
        this.configureCostControl(this.costMaxRange, this.costMidM, this.costLimitMaxM);

        this.costMinInput.value = '';
        this.costMaxInput.value = '';
        this.costMinInput.placeholder = this.costLimitMinM;
        this.costMaxInput.placeholder = this.costLimitMaxM;
        this.costMinRange.value = this.costLimitMinM;
        this.costMaxRange.value = this.costLimitMaxM;
        this.updateCostTrack();
    }

    configureCostControl(control, min, max) {
        control.min = min;
        control.max = max;
        control.step = COST_STEP;
    }

    bindCostControls() {
        this.costMinRange.oninput = () => {
            const value = Number(this.costMinRange.value);
            this.costMinInput.value = value <= this.costLimitMinM ? '' : value;
            this.updateCostTrack();
        };

        this.costMaxRange.oninput = () => {
            const value = Number(this.costMaxRange.value);
            this.costMaxInput.value = value >= this.costLimitMaxM ? '' : value;
            this.updateCostTrack();
        };

        this.costMinInput.oninput = () => {
            const value = this.readCostInput(this.costMinInput);
            this.costMinRange.value = value === null
                ? this.costLimitMinM
                : clamp(value, this.costLimitMinM, this.costMidM);
            this.updateCostTrack();
        };

        this.costMaxInput.oninput = () => {
            const value = this.readCostInput(this.costMaxInput);
            this.costMaxRange.value = value === null
                ? this.costLimitMaxM
                : clamp(value, this.costMidM, this.costLimitMaxM);
            this.updateCostTrack();
        };

        this.costMinInput.onblur = () => this.normalizeCostInput(this.costMinInput, true);
        this.costMaxInput.onblur = () => this.normalizeCostInput(this.costMaxInput, false);
    }

    normalizeCostInput(input, isMin) {
        if (this.costMidM === null) {
            input.value = '';
            return;
        }

        const value = this.readCostInput(input);
        const limit = isMin ? this.costLimitMinM : this.costLimitMaxM;
        const range = isMin ? this.costMinRange : this.costMaxRange;

        if (value === null) {
            input.value = '';
            range.value = limit;
            this.updateCostTrack();
            return;
        }

        const [min, max] = isMin
            ? [this.costLimitMinM, this.costMidM]
            : [this.costMidM, this.costLimitMaxM];
        const clamped = clamp(value, min, max);
        const atLimit = isMin ? clamped <= this.costLimitMinM : clamped >= this.costLimitMaxM;

        input.value = atLimit ? '' : clamped;
        range.value = clamped;
        this.updateCostTrack();
    }

    updateCostTrack() {
        if (this.costMidM === null || !this.costTrack)
            return;

        const minValue = this.readCostInput(this.costMinInput) ?? this.costLimitMinM;
        const maxValue = this.readCostInput(this.costMaxInput) ?? this.costLimitMaxM;

        const minM = clamp(minValue, this.costLimitMinM, this.costMidM);
        const maxM = clamp(maxValue, this.costMidM, this.costLimitMaxM);

        const leftRange = this.costMidM - this.costLimitMinM;
        const rightRange = this.costLimitMaxM - this.costMidM;

        const leftPercent = leftRange > 0
            ? ((minM - this.costLimitMinM) / leftRange) * 50
            : 0;
        const rightPercent = rightRange > 0
            ? 50 + ((maxM - this.costMidM) / rightRange) * 50
            : 100;

        this.costTrack.style.left = `${leftPercent}%`;
        this.costTrack.style.width = `${Math.max(rightPercent - leftPercent, 0)}%`;
    }

    bindActions() {
        this.applyButton.onclick = () => this.bus.emit(SearchEvents.Request, this.activeFilters());
        this.resetButton.onclick = () => this.reset();
    }

    readCostInput(input) {
        const raw = input.value.trim();
        if (raw === '')
            return null;

        const value = Number(raw);
        return Number.isFinite(value) ? value : null;
    }

    activeFilters() {
        const filters = {};

        const types = Array.from(this.typesContainer.querySelectorAll('input:checked'))
            .map(input => Number(input.value));

        if (types.length > 0)
            filters.types = types;

        const costMin = this.readCostValue(this.costMinInput, true);
        let costMax = this.readCostValue(this.costMaxInput, false);

        if (costMin !== null && costMax !== null && costMin > costMax)
            costMax = costMin;

        if (costMin !== null)
            filters.costMin = costMin;

        if (costMax !== null)
            filters.costMax = costMax;

        return filters;
    }

    readCostValue(input, isMin) {
        if (this.costMidM === null)
            return null;

        const value = this.readCostInput(input);
        if (value === null)
            return null;

        if (isMin) {
            const clamped = clamp(value, this.costLimitMinM, this.costMidM);
            return clamped <= this.costLimitMinM ? null : Math.round(clamped * MILLION);
        }

        const clamped = clamp(value, this.costMidM, this.costLimitMaxM);
        return clamped >= this.costLimitMaxM ? null : Math.round(clamped * MILLION);
    }

    setResultCount(count) {
        this.resultCount = count;

        if (!this.loading)
            this.updateButtonText();
    }

    setLoading(loading) {
        this.loading = loading;
        this.applyButton.disabled = loading;
        this.resetButton.disabled = loading;
        this.applyButton.style.opacity = loading ? '0.5' : '';
        this.resetButton.style.opacity = loading ? '0.5' : '';
        this.updateButtonText();
    }

    updateButtonText() {
        if (this.loading) {
            this.applyButton.textContent = 'Ищем...';
            return;
        }

        if (this.resultCount === null) {
            this.applyButton.textContent = 'Показать квартиры';
            return;
        }

        this.applyButton.textContent = `Показать ${this.resultCount} ${apartmentsWord(this.resultCount)}`;
    }

    reset() {
        for (const input of this.typesContainer.querySelectorAll('input'))
            input.checked = false;

        this.costMinInput.value = '';
        this.costMaxInput.value = '';

        if (this.costLimitMinM !== null) {
            this.costMinRange.value = this.costLimitMinM;
            this.costMaxRange.value = this.costLimitMaxM;
        }

        this.updateCostTrack();
        this.resultCount = null;
        this.updateButtonText();
        this.bus.emit(SearchEvents.Request, {});
    }
}
