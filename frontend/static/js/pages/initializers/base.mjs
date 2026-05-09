import { EventBus } from "../../core/event-bus.mjs";
import { DomRegistry } from "../../core/dom-registry.mjs";

import { PopupContainer } from "../../popup/container.mjs";
import { PopupController } from "../../popup/controller.mjs";

import { FeedbackApi } from "../../api/feedback.mjs";
import { FeedbackStore } from "../../store/feedback.mjs";
import { FeedbackController } from "../base/feedback-controller.mjs";

import { LeftSideModal, RightSideModal } from "../../modals/side-modal.mjs"
import { FooterButtons } from "../../elements/base/footer-buttons.mjs";

import { MenuHighlighter } from "../base/menu-highlighter.mjs";


function createPopupContainer(bus, registry) {
    try {
        registry.register('popup-container', '#popup-container');
        registry.register('popup-message', '#popup-message-template');
        return new PopupContainer({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
        return null;
    }
}


function createLeftSideModal(bus, registry) {
    try {
        registry.register('left-side-modal', '#left-side-modal');
        return new LeftSideModal({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
        return null;
    }
}


function createRightSideModal(bus, registry) {
    try {
        registry.register('right-side-modal', '#right-side-modal');
        return new RightSideModal({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
        return null;
    }
}


function createFooterButtons(bus, registry) {
    try {
        registry.register('left-footer-button', '#left-footer-button');
        registry.register('right-footer-button', '#right-footer-button');
        return new FooterButtons({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
        return null;
    }
}

function createMenuHighlighter(registry) {
    try {
        registry.register('menu-home', '#menu-home');
        registry.register('menu-projects', '#menu-projects');
        registry.register('menu-promo', '#menu-promo');
        registry.register('menu-gallery', '#menu-gallery');
        registry.register('menu-contacts', '#menu-contacts');
        return new MenuHighlighter(registry);
    } catch (err) {
        console.log(err);
        return null;
    }
}

export const bus = new EventBus();
export const registry = new DomRegistry();

document.addEventListener("DOMContentLoaded", () => {
    const popupContainer = createPopupContainer(bus, registry);
    const popupController = new PopupController(bus);

    const leftSideModal = createLeftSideModal(bus, registry);
    const rightSideModal = createRightSideModal(bus, registry);

    const footerButtons = createFooterButtons(bus, registry);

    const feedbackApi = new FeedbackApi();
    const feedbackStore = new FeedbackStore({api: feedbackApi, bus: bus});
    const feedbackController = new FeedbackController({controller: feedbackStore, bus: bus});

    const menuHighlighter = createMenuHighlighter(registry);
});