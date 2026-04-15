import { SideModal } from "../modals/side-modal.mjs"


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