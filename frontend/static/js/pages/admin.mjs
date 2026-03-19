import { requestAllProjects, deleteProject, setProjectDraftStatus, updateProject, createProject } from "../api/project.mjs";
import { requestAllFilesDescriptions, uploadFile, deleteFile, downloadFile } from "../api/media.mjs";
import { requestAllPromos, createPromo, updatePromo, setPromoDraftStatus, deletePromo } from "../api/promotion.mjs";
import { TooltipModal } from "../common/tooltip-modal.mjs";
import { ProjectEditModal } from "../admin/projects/project-edit-modal.mjs";
import { PromoEditModal } from "../admin/promo/promo-edit-modal.mjs";
import { ConfirmModal } from "../common/confirm-modal.mjs";
import { ProjectItemTemplates } from "../projects/project-item.mjs";
import { ProjectsSubpage, ProjectsRequests, ProjectsDom } from "../admin/projects/projects-subpage.mjs";
import { DndZone } from "../common/dnd.mjs";
import { MediaSubpage, MediaRequests, MediaSubpageDom } from "../admin/media/media-subpage.mjs";
import { PromoSubpage, PromoRequests, PromoSubageDom } from "../admin/promo/promo-subpage.mjs";
import { ChooseFileButton } from "../common/choose-files-button.mjs";
import { SubpageManager } from "../admin/subpage-manager.mjs";
import { MediaModal } from "../admin/media/media-modal.mjs";

function createTooltipModal() {
    try {
        return new TooltipModal(document.getElementById('tooltip-modal'));
    } catch (err) {
        // TODO toast message
        console.log(err);
        return null;
    }
}

function createConfirmModal() {
    try {
        return new ConfirmModal(document.getElementById('confirm-modal'));
    } catch (err) {
        // TODO toast message
        console.log(err);
        return null;
    }
}

function createProjectSubpage(tooltipModal, confirmModal) {
    try {
        const projectEditModal = new ProjectEditModal({
            modal: document.getElementById('project-edit-modal'), 
            tooltip: tooltipModal
        });

        const requests = new ProjectsRequests({
            asyncLoader: requestAllProjects,
            asyncDeleter: deleteProject,
            asyncSetDraftStatus: setProjectDraftStatus,
            asyncUpdater: updateProject,
            asyncCreator: createProject,
        });

        const dom = new ProjectsDom({
            pageContainer: document.getElementById('projects-subpage'),
            itemsContainer: document.getElementById('projects-container'),
            createButton: document.getElementById('create-project-button'),
            adminTemplate: document.getElementById('admin-project-item-template'),
            baseTemplates: new ProjectItemTemplates({
                projectTemplate: document.getElementById('project-item-template'),
                tagTemplate: document.getElementById('project-tag-template'),
                apartTemplate: document.getElementById('project-apartment-template'),
                soldOutTemplate: document.getElementById('project-apartment-sold-out-template')
            })
        });

        return new ProjectsSubpage({
            requests: requests,
            dom: dom,
            editModal: projectEditModal,
            confirmModal: confirmModal,
            createButton: document.getElementById('create-project-button'),
            itemsContainer: document.getElementById('projects-container'),
            elementTemplate: document.getElementById('project-preview-template')
        });
    } catch (err) {
        // TODO toast message
        console.log(err);
        return null;
    }
}

function createMediaSubpage(confirmModal) {
    try {
        const dom = new MediaSubpageDom({
            pageContainer: document.getElementById('media-subpage'),
            itemsContainer: document.getElementById('media-container'),
            itemTemplate: document.getElementById('media-item-template')
        });

        const requests = new MediaRequests({
            asyncLoader: requestAllFilesDescriptions,
            asyncUploader: uploadFile,
            asyncDeleter: deleteFile,
            asyncFileDownloader: downloadFile
        });

        const dnd = new DndZone({
            wrapper: document.getElementById('media-wrapper'),
            dndzone: document.getElementById('media-drop-overlay')
        });

        const chooseFileButton = new ChooseFileButton({
            button: document.getElementById('choose-media-button'),
            input: document.getElementById('choose-media-input'),
        });

        const infoModal = new MediaModal({element: document.getElementById('media-modal')});

        return new MediaSubpage({
            requests: requests,
            dom: dom,
            dnd: dnd,
            infoModal: infoModal,
            confirmModal: confirmModal,
            chooseFiles: chooseFileButton
        });
    } catch (err) {
        // TODO toast message
        console.log(err);
        return null;
    }
}

function createPromoSubpage(tooltipModal, confirmModal) {
    try {
        const requests = new PromoRequests({
            asyncLoader: requestAllPromos,
            asyncCreator: createPromo,
            asyncUpdater: updatePromo,
            asyncDeleter: deletePromo,
            asyncSetDraftStatus: setPromoDraftStatus
        });

        const dom = new PromoSubageDom({
            pageContainer: document.getElementById('promo-subpage'),
            itemsContainer: document.getElementById('promo-container'),
            createButton: document.getElementById('create-promo-button'),
            basePromoTemplate: document.getElementById('promo-item-template'),
            adminPromoTemplate: document.getElementById('promo-editable-item-template')
        });

        const editModal = new PromoEditModal({
            modal: document.getElementById('promo-edit-modal'),
            tooltip: tooltipModal
        });

        return new PromoSubpage({
            requests: requests,
            dom: dom,
            editModal: editModal,
            confirmModal: confirmModal
        });
    } catch (err) {
        // TODO toast message
        console.log(err);
        return null;
    }
}

function createAppartmentSubpage(tooltipModal, confirmModal) {
    try {
        return null;
    } catch (err) {
        // TODO toast message
        console.log(err);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const tooltipModal = createTooltipModal();
    const confirmModal = createConfirmModal();

    const projectsSubpage = createProjectSubpage(tooltipModal, confirmModal);
    const appartmentSubpage = createAppartmentSubpage(tooltipModal, confirmModal);
    const mediaSubpage = createMediaSubpage(confirmModal);
    const promoSubpage = createPromoSubpage(tooltipModal, confirmModal);
    
    const subpageManager = new SubpageManager({
        mapping: {
            'projects-page-button': projectsSubpage,
            'appartments-page-button': appartmentSubpage,
            'promo-page-button': promoSubpage,
            'media-page-button': mediaSubpage
        }
    });
});