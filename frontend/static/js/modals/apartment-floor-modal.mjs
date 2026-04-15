import { ModalWithTwoButtons } from "./modal.mjs";
import { isEmpty, isIntegerNumber, toggleOutlineRed } from "../utils/utils.mjs";
import { ModalEvents } from "../core/events.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'apartment-id-tooltip': 'Уникальный идентификатор планировки. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'floor-tooltip': 'Этаж квартиры. Целое число.',
    'number-tooltip': 'Номер квартиры. Целое число',
    'cost-tooltip': 'Цена квартиры в рублях. Целое число.',
};


function inputNumberValidator(input) {
    toggleOutlineRed(input, !isIntegerNumber(input.value));
}


export class ApartmentFloorModal extends ModalWithTwoButtons {
    constructor({registry, bus}) {
        super(registry.get('apartment-floor-modal'));
        this.bus = bus;

        this.windowTitle = this.element.querySelector('[name="title"]');

        this.id = this.element.querySelector('[name="id"]');
        this.apartmentId = this.element.querySelector('[name="apartment-id"]');
        this.floor = this.element.querySelector('[name="floor-input"]');
        this.number = this.element.querySelector('[name="number-input"]');
        this.cost = this.element.querySelector('[name="cost-input"]');

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => this.bus.emit(ModalEvents.Tooltip.Open, tooltips[button.name]);

        for (const input of this.element.querySelectorAll('input[type="number"]'))
            input.addEventListener('input', () => inputNumberValidator(input));

        this.bus.on(ModalEvents.ApartmentFloor.Open, (payload) => {
            this.setTitle(payload.title ?? 'Создать квартиру');
            this.update(payload.data ?? {});
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.ApartmentFloor.Confirmed, data);
        
        this.rejectClicked = () => {
            this.bus.emit(ModalEvents.ApartmentFloor.Rejected);
            this.resetInputOutline();
        };
    }

    setTitle(text) {
        this.windowTitle.textContent = text;
    }

    update(data) {
        this.id.textContent = data.id ?? '';
        this.apartmentId.textContent = data.apartmentId ?? '';
        this.floor.value = data.floor ?? '';
        this.number.value = data.number ?? '';
        this.cost.value = data.cost ?? '';
    }

    data() {
        let result = {
            apartmentId: this.apartmentId.textContent,
            floor: this.floor.value,
            number: this.number.value,
            cost: this.cost.value
        };

        if (!isEmpty(this.id.textContent))
            result.id = this.id.textContent;
        
        return result;
    }

    validate() {
        let ok = true;

        ok &&= isIntegerNumber(this.floor.value);
        toggleOutlineRed(this.floor, !isIntegerNumber(this.floor.value));

        ok &&= isIntegerNumber(this.number.value);
        toggleOutlineRed(this.number, !isIntegerNumber(this.number.value));

        ok &&= isIntegerNumber(this.cost.value);
        toggleOutlineRed(this.cost, !isIntegerNumber(this.cost.value));

        return ok;
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }
}