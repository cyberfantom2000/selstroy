import { Modal } from "./modal.mjs"
import { ModalEvents } from "../core/events.mjs";
import { isEmpty, toggleOutlineRed } from "../utils/utils.mjs";


class SideModal extends Modal {
    constructor(modal, position) {
        super(modal);
        this.position = position;

        this.panel = this.element.querySelector('[name="panel"]');
        this.element.querySelector('[name="submit"]').onclick = () => this.submit();
    }

    resetInputOutline() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);
    }

    show() {
        super.show();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.panel.classList.remove(this.position === 'left' ? '-translate-x-full' : 'translate-x-full');
                this.panel.classList.add('translate-x-0');
                this.background.classList.remove('opacity-0');
                this.background.classList.add('opacity-100');
            });
        });
    }

    hide() {
        this.panel.classList.remove('translate-x-0');
        this.panel.classList.add(this.position === 'left' ? '-translate-x-full' : 'translate-x-full');

        this.background.classList.remove('opacity-100');
        this.background.classList.add('opacity-0');

        setTimeout(() => {
            super.hide();
        }, 300);
    }
}


export class LeftSideModal extends SideModal {
    constructor({registry, bus}) {
        super(registry.get('left-side-modal'), 'left');
        this.bus = bus;
        this.phone = this.element.querySelector('[name="phone"]');
        this.name = this.element.querySelector('[name="name"]');

        this.bus.on(ModalEvents.SideLeft.Open, () => {
            this.resetInputOutline();
            this.show();
        });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.SideLeft.Confirmed, data);
        this.rejectClicked = () => this.bus.emit(ModalEvents.SideLeft.Rejected)
    }

    data() {
        return {
            phone: this.phone.value,
            name: this.name.value
        };
    }

    validate() {
        toggleOutlineRed(this.phone, isEmpty(this.phone.value));
        return !isEmpty(this.phone.value);
    }
}


export class RightSideModal extends SideModal {
    constructor({registry, bus}) {
        super(registry.get('right-side-modal'), 'right');
        this.bus = bus;
        this.email = this.element.querySelector('[name="email"]');
        this.name = this.element.querySelector('[name="name"]');
        this.subject = this.element.querySelector('[name="subject"]');
        this.message = this.element.querySelector('[name="message"]');

        this.bus.on(ModalEvents.SideRight.Open, () => {
            this.resetInputOutline();
            this.show();
        });
        
        this.bus.on(ModalEvents.SideRight.Clear, () => { this.message.value = ''; });

        this.submitClicked = (data) => this.bus.emit(ModalEvents.SideRight.Confirmed, data);
        this.rejectClicked = () => this.bus.emit(ModalEvents.SideRight.Rejected)
    }

    data() {
        return {
            name: this.name.value,
            email: this.email.value,
            subject: this.subject.value,
            body: this.message.value
        };
    }

    validate() {
        let ok = true;

        ok &&= !isEmpty(this.name.value);
        toggleOutlineRed(this.name, isEmpty(this.name.value));

        ok &&= !isEmpty(this.email.value);
        toggleOutlineRed(this.email, isEmpty(this.email.value));

        ok &&= !isEmpty(this.subject.value);
        toggleOutlineRed(this.subject, isEmpty(this.subject.value));

        return ok;
    }
}