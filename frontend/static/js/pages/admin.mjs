import { requestAllProjects, deleteProject, setDraftStatus, updateProject, createProject } from "../api/project.mjs";
import { TooltipModal } from "../admin/tooltipmodal.mjs";
import { ProjectEditModal } from "../admin/projects/editmodal.mjs";
import { ConfirmModal } from "../admin/confirmmodal.mjs";
import { ProjectsSubpage, ProjectsRequests } from "../admin/projects/projectssubpage.mjs";

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
        asyncSetDraftStatus: setDraftStatus,
        asyncEditor: updateProject,
        asyncCreator: createProject,
    });

    const projectsPreview = new ProjectsSubpage({
        requests: projectsRequests,
        editModal: projectEditModal,
        confirmModal: confirmModal,
        createButton: document.getElementById('create-project-button'),
        itemsContainer: document.getElementById('projects-container'),
        elementTemplate: document.getElementById('project-preview-template')
    });
});