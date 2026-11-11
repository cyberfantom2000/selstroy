import { apartmentTypeLabel } from "../../apartment/type.mjs";


export class ApartmentsSearchFilter {
    constructor({registry, types}) {
        this.registry = registry;
        this.element = registry.getTemplate('apartments-filter-template');
        this.typesContainer = this.element.querySelector('[name="types"]');

        for (const type of types) {
            const chip = registry.getTemplate('apartments-filter-type-template');
            chip.querySelector('span').textContent = apartmentTypeLabel(type);
            chip.querySelector('input').value = type;
            this.typesContainer.appendChild(chip);
        }
    }
}
