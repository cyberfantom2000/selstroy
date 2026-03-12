import { requestAllProjects, deleteProject, setDraftStatus, updateProject, createProject } from "../api/project.mjs";
import { requestAllFilesDescriptions, uploadFile, deleteFile, downloadFile } from "../api/media.mjs";
import { TooltipModal } from "../common/tooltip-modal.mjs";
import { ProjectEditModal } from "../admin/projects/project-edit-modal.mjs";
import { ConfirmModal } from "../common/confirm-modal.mjs";
import { ProjectsSubpage, ProjectsRequests } from "../admin/projects/projects-subpage.mjs";
import { DndZone } from "../common/dnd.mjs";
import { MediaSubpage, MediaRequests, MediaSubpageDom } from "../admin/media/media-subpage.mjs";
import { ChooseFileButton } from "../common/choose-files-button.mjs";
import { SubpageManager } from "../admin/subpage-manager.mjs";
import { MediaModal } from "../admin/media/media-modal.mjs";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById
    const subpageManager = new SubpageManager({
        mapping: {
            'projects-page-button': 'projects-subpage',
            'appartments-page-button': 'apartments-subpage',
            'promo-page-button': 'promo-subpage',
            'media-page-button': 'media-subpage'
        }
    });

    const tooltipModal = new TooltipModal(document.getElementById('tooltip-modal'));
    const confirmModal = new ConfirmModal(document.getElementById('confirm-modal'));

    const projectEditModal = new ProjectEditModal({
        modal: document.getElementById('project-edit-modal'), 
        tooltip: tooltipModal
    });

    const projectsRequests = new ProjectsRequests({
        asyncLoader: requestAllProjects,
        asyncDeleter: deleteProject,
        asyncSetDraftStatus: setDraftStatus,
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
        itemTemplate: document.getElementById('media-item-template'),
        chooseButton: document.getElementById('choose-media-button')
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
});