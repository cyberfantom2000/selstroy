import { PopupEvents } from "../../core/events.mjs";
import { EventBus } from "../../core/event-bus.mjs";
import { DomRegistry } from "../../core/dom-registry.mjs";

import { TooltipModal } from "../../common/tooltip-modal.mjs";
import { ConfirmModal } from "../../common/confirm-modal.mjs";
import { ImageViewModal, EditableImageModal } from "../../common/image-modal.mjs";
import { IFrameViewModal, EditableIFrameModal } from "../../common/iframe-modal.mjs";

import { MediaApi } from "../../api/media.mjs";
import { MediaStore } from "../../store/media.mjs";
import { AdminMediaController } from "../../media/admin/controller.mjs";
import { AdminMediaSubpage } from "../../media/admin/subpage.mjs";
import { MediaModal } from "../../media/admin/modal.mjs";

import { PromoApi } from "../../api/promo.mjs";
import { PromoStore } from "../../store/promo.mjs";
import { AdminPromoController } from "../../promo/admin/controller.mjs";
import { AdminPromoSubpage } from "../../promo/admin/subpage.mjs";
import { PromoModal } from "../../promo/admin/modal.mjs";

import { ProjectApi } from "../../api/project.mjs"
import { ProjectStore } from "../../store/project.mjs"
import { AdminProjectController } from "../../projects/admin/controller.mjs";
import { AdminProjectsSubpage } from "../../projects/admin/subpage.mjs"
import { ProjectModal } from "../../projects/admin/modal.mjs";
import { ProjectDetailModal } from "../../projects/admin/detail-modal.mjs";

import { ApartmentApi } from "../../api/apartment.mjs";
import { ApartmentStore } from "../../store/apartment.mjs";
import { AdminApartmentController } from "../../apartment/admin/controller.mjs";
import { ApartmentModal } from "../../apartment/admin/modal.mjs";
import { ApartmentImageModal } from "../../apartment/admin/image-modal.mjs";
import { ApartmentFloorModal } from "../../apartment/admin/floor-modal.mjs";

import { SubpageNavigator } from "../subpage-navigator.mjs";
import { SubpageLoader } from "../subpage-loader.mjs";
import { SubpageController } from "../subpage-controller.mjs";

import { PopupContainer } from "../../popup/container.mjs";
import { PopupController } from "../../popup/controller.mjs";


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


function createTooltipModal(bus, registry) {
    try {
        registry.register('tooltip-modal', '#tooltip-modal');
        return new TooltipModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createConfirmModal(bus, registry) {
    try {
        registry.register('confirm-modal', '#confirm-modal');
        return new ConfirmModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createEditableImageModal(bus, registry) {
    try {
        registry.register('editable-image-modal', '#editable-image-modal');
        return new EditableImageModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createImageViewModal(bus, registry) {
    try {
        registry.register('image-view-modal', '#image-view-modal');
        return new ImageViewModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createEditableIFrameModal(bus, registry) {
    try {
        registry.register('editable-iframe-modal', '#editable-iframe-modal');
        return new EditableIFrameModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createIFrameViewModal(bus, registry) {
    try {
        registry.register('iframe-view-modal', '#iframe-view-modal');
        return new IFrameViewModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createMediaModal(bus, registry) {
    try {
        registry.register('media-modal', '#media-modal');
        return new MediaModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createMediaSubpage(bus, registry) {
    try {
        registry.register('media-subpage', '#media-subpage');
        registry.register('media-subpage-container', '#media-container');
        registry.register('media-item', '#media-item-template');
        registry.register('media-dnd-wrapper', '#media-wrapper');
        registry.register('media-dnd-dropzone', '#media-drop-overlay');
        registry.register('media-choose-button', '#choose-media-button');
        registry.register('media-choose-input', '#choose-media-input');
        return new AdminMediaSubpage({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createPromoModal(bus, registry) {
    try {
        registry.register('promo-modal', '#promo-modal');
        return new PromoModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createPromoSubpage(bus, registry) {
    try {
        registry.register('promo-subpage', '#promo-subpage');
        registry.register('promo-subpage-container', '#promo-container');
        registry.register('create-promo-button', '#create-promo-button');
        registry.register('promo-item-admin-template', '#promo-item-admin-template');
        registry.register('promo-item-base-template', '#promo-item-template');
        return new AdminPromoSubpage({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createProjectModal(bus, registry) {
    try {
        registry.register('project-modal', '#project-modal');
        return new ProjectModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createProjectDetailModal(bus, registry) {
    try {
        registry.register('project-detail-modal', '#project-detail-modal');
        return new ProjectDetailModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createProjectsSubpage(bus, registry) {
    try {
        registry.register('projects-subpage', '#projects-subpage');
        registry.register('projects-subpage-container', '#projects-container');
        registry.register('create-project-button', '#create-project-button');
        registry.register('project-group-admintemplate', '#project-group-admintemplate');
        registry.register('project-item-template', '#project-item-template');
        registry.register('project-item-admin-template', '#admin-project-item-template');
        registry.register('project-tag-template', '#project-tag-template');
        registry.register('project-detail-admin-template', '#project-detail-admin-template');
        registry.register('editable-image-template', '#editable-image-template');
        registry.register('editable-iframe-template', '#editable-iframe-template');
        registry.register('apartment-item-template', '#apartment-item-template');
        registry.register('apartment-item-admin-template', '#apartment-item-admin-template');
        registry.register('apartment-floor-template', '#apartment-floor-admin-template');
        return new AdminProjectsSubpage({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createApartmentModal(bus, registry) {
    try {
        registry.register('apartment-modal', '#apartment-modal');
        return new ApartmentModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createApartmentImageModal(bus, registry) {
    try {
        registry.register('apartment-image-modal', '#apartment-image-modal');
        return new ApartmentImageModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createApartmentFloorModal(bus, registry) {
    try {
        registry.register('apartment-floor-modal', '#apartment-floor-modal');
        return new ApartmentFloorModal({registry: registry, bus: bus});
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


function createSubpageNavigator(bus, registry) {
    try {
        registry.register('projects-subpage-button', '#projects-page-button');
        registry.register('promo-subpage-button', '#promo-page-button');
        registry.register('media-subpage-button', '#media-page-button');
        return new SubpageNavigator(bus);
    } catch (err) {
        bus.emit(PopupEvents.Message.Err.Show, err);
        console.log(err);
        return null;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const bus = new EventBus();
    const registry = new DomRegistry();

    const popupContainer = createPopupContainer(bus, registry);
    const popupController = new PopupController(bus);

    const tooltipModal = createTooltipModal(bus, registry);
    const confirmModal = createConfirmModal(bus, registry);
    const editableImageModal = createEditableImageModal(bus, registry);
    const editableIFrameModal = createEditableIFrameModal(bus, registry);
    const imageModal = createImageViewModal(bus, registry);
    const iframeModal = createIFrameViewModal(bus, registry);

    // TODO Перенести в отложенную инициализацию и создавать это все когда SubpageManager открывает страницу
    const mediaModal = createMediaModal(bus, registry);
    const mediaSubpage = createMediaSubpage(bus, registry);
    const mediaApi = new MediaApi();
    const mediaStore = new MediaStore({api: mediaApi, bus: bus});
    const mediaController = new AdminMediaController({bus: bus, store: mediaStore});

    const promoModal = createPromoModal(bus, registry);
    const promoSubpage = createPromoSubpage(bus, registry);
    const promoApi = new PromoApi();
    const promoStore = new PromoStore({api: promoApi, bus: bus});
    const promoController = new AdminPromoController({bus: bus, store: promoStore});

    const projectModal = createProjectModal(bus, registry);
    const projectDetailModal = createProjectDetailModal(bus, registry);
    const projectsSubpage = createProjectsSubpage(bus, registry);
    const projectsApi = new ProjectApi();
    const projectsStore = new ProjectStore({api: projectsApi, bus: bus});
    const projectsController = new AdminProjectController({bus: bus, store: projectsStore});


    const apartmentModal = createApartmentModal(bus, registry);
    const apartmentImageModal = createApartmentImageModal(bus, registry);
    const floorModal = createApartmentFloorModal(bus, registry);
    const apartmentApi = new ApartmentApi();
    const apartmentStore = new ApartmentStore({api: apartmentApi, bus: bus});
    const apartmentController = new AdminApartmentController({bus: bus, store: apartmentStore});

    const pageNavigator = createSubpageNavigator(bus, registry);
    pageNavigator.bind(registry.get('projects-subpage-button'), projectsSubpage);
    pageNavigator.bind(registry.get('promo-subpage-button'), promoSubpage);
    pageNavigator.bind(registry.get('media-subpage-button'), mediaSubpage);

    const pageLoader = new SubpageLoader(bus);
    pageLoader.bind(promoSubpage, async () => { await promoController.load(); });
    pageLoader.bind(mediaSubpage, async () => { await mediaController.load(); });
    pageLoader.bind(projectsSubpage, async () => { 
        await projectsController.load();
        await apartmentController.load();
    });

    const pageController = new SubpageController(bus);
});