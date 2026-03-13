import { requestAllProjects, deleteProject, setProjectDraftStatus, updateProject, createProject } from "../api/project.mjs";
import { requestAllFilesDescriptions, uploadFile, deleteFile, downloadFile } from "../api/media.mjs";
import { requestAllPromos, createPromo, updatePromo, setPromoDraftStatus, deletePromo } from "../api/promotion.mjs";
import { TooltipModal } from "../common/tooltip-modal.mjs";
import { ProjectEditModal } from "../admin/projects/project-edit-modal.mjs";
import { PromoEditModal } from "../admin/promo/promo-edit-modal.mjs";
import { ConfirmModal } from "../common/confirm-modal.mjs";
import { ProjectsSubpage, ProjectsRequests } from "../admin/projects/projects-subpage.mjs";
import { DndZone } from "../common/dnd.mjs";
import { MediaSubpage, MediaRequests, MediaSubpageDom } from "../admin/media/media-subpage.mjs";
import { PromoSubpage, PromoRequests, PromoSubageDom } from "../admin/promo/promo-subpage.mjs";
import { ChooseFileButton } from "../common/choose-files-button.mjs";
import { SubpageManager } from "../admin/subpage-manager.mjs";
import { MediaModal } from "../admin/media/media-modal.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const tooltipModal = new TooltipModal(document.getElementById('tooltip-modal'));
    const confirmModal = new ConfirmModal(document.getElementById('confirm-modal'));

    const projectEditModal = new ProjectEditModal({
        modal: document.getElementById('project-edit-modal'), 
        tooltip: tooltipModal
    });

    const projectsRequests = new ProjectsRequests({
        asyncLoader: requestAllProjects,
        asyncDeleter: deleteProject,
        asyncSetDraftStatus: setProjectDraftStatus,
        asyncEditor: updateProject,
        asyncCreator: createProject,
    });

    const projectsSubpage = new ProjectsSubpage({
        requests: projectsRequests,
        editModal: projectEditModal,
        confirmModal: confirmModal,
        createButton: document.getElementById('create-project-button'),
        itemsContainer: document.getElementById('projects-container'),
        elementTemplate: document.getElementById('project-preview-template')
    });

    const mediaDom = new MediaSubpageDom({
        pageContainer: document.getElementById('media-subpage'),
        itemsContainer: document.getElementById('media-container'),
        itemTemplate: document.getElementById('media-item-template')
    });

    const mediaRequests = new MediaRequests({
        asyncLoader: requestAllFilesDescriptions,
        asyncUploader: uploadFile,
        asyncDeleter: deleteFile,
        asyncFileDownloader: downloadFile
    });

    const mediaDnd = new DndZone({
        wrapper: document.getElementById('media-wrapper'),
        dndzone: document.getElementById('media-drop-overlay')
    });

    const chooseFileButton = new ChooseFileButton({
        button: document.getElementById('choose-media-button'),
        input: document.getElementById('choose-media-input'),
    });

    const mediaInfoModal = new MediaModal({element: document.getElementById('media-modal')});

    const mediaSubpage = new MediaSubpage({
        requests: mediaRequests,
        dom: mediaDom,
        dnd: mediaDnd,
        infoModal: mediaInfoModal,
        confirmModal: confirmModal,
        chooseFiles: chooseFileButton
    });

    const promoRequests = new PromoRequests({
        asyncLoader: requestAllPromos,
        asyncCreator: createPromo,
        asyncUpdater: updatePromo,
        asyncDeleter: deletePromo,
        asyncSetDraftStatus: setPromoDraftStatus
    });

    const promoDom = new PromoSubageDom({
        pageContainer: document.getElementById('promo-subpage'),
        itemsContainer: document.getElementById('promo-container'),
        createButton: document.getElementById('create-promo-button'),
        basePromoTemplate: document.getElementById('promo-item-template'),
        adminPromoTemplate: document.getElementById('promo-editable-item-template')
    });

    const promoEditModal = new PromoEditModal({
        modal: document.getElementById('promo-edit-modal'),
        tooltip: tooltipModal
    });

    const promoSubpage = new PromoSubpage({
        requests: promoRequests,
        dom: promoDom,
        editModal: promoEditModal,
        confirmModal: confirmModal
    });

    const subpageManager = new SubpageManager({
        mapping: {
            'projects-page-button': projectsSubpage,
            'appartments-page-button': null,
            'promo-page-button': promoSubpage,
            'media-page-button': mediaSubpage
        }
    });
});