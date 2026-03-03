
class SideModal {
    constructor(modal_id, open_button_id, async_callback = null) {
        this.modal = document.getElementById(modal_id);
        this.open_button = document.getElementById(open_button_id);
        this.close_button = this.modal.querySelector('[name="close-button"]');
        this.background = this.modal.querySelector('[name="background"]');
        this.async_callback = async_callback;

        if (this.async_callback !== null)
            this.modal.querySelector('[name="submit"]').onclick = async () => { await this.async_callback(this);};

        this.open_button.onclick = () => { this.open(); };
        this.close_button.onclick = () => { this.close(); };
        this.background.onclick = () => { this.close(); };
    }

    open() {
        this.modal.classList.remove('hidden');
    }

    close() {
        this.modal.classList.add('hidden');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const leftModal = new SideModal('modal-left', 'left-menu-button', async (self_modal) => {
        // post request to server
        // add request reply to popup
        self_modal.close();
    });

    const rightModal = new SideModal('modal-right', 'right-menu-button', async (self_modal) => {
        // post request to server
        // add request reply to popup
        self_modal.close();
    });
});