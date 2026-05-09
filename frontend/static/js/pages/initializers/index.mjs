import { registry, bus } from "./base.mjs";

import { PopupEvents, PromoEvents, ProjectEvents } from "../../core/events.mjs";

import { PromoApi } from "../../api/promo.mjs";
import { PromoStore } from "../../store/promo.mjs";

import { ProjectApi } from "../../api/project.mjs";
import { ProjectStore } from "../../store/project.mjs";
import { ProjectsPreviewContainer } from "../index/projects-container.mjs";

import { ImageCarousel } from "../../components/carousel.mjs";


function createPromoCarousel(registry, bus) {
    try {
        registry.register('carousel-dot-template', '#carousel-dot-template');
        registry.register('carousel-slide-template', '#carousel-slide-template');
        registry.register('promo-carousel-container', '#promo-carousel');
        const carousel = new ImageCarousel({container: registry.get('promo-carousel-container'), registry: registry});

        bus.on(PromoEvents.Update, (items) => {
            const slides = items.map((el) => {
                return { url: el.imageUrl, href: '/promo' };
            });

            carousel.clear();
            carousel.append(slides);
            carousel.play(10);
        });

        bus.on(PromoEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить акции. Попробуйте обновить страницу или возвращайтесь позднее');
        });
    } catch (err) {
        console.log(err);
    }
}

function createProjectsPreviewContainer(registry, bus) {
    try {
        registry.register('projects-preview-container', '#projects-preview-container');
        registry.register('project-preview-template', '#project-preview-item-template');
        registry.register('project-preview-description-template', '#project-preview-description-template');
        const previewContainer = new ProjectsPreviewContainer({registry: registry, bus: bus});

        bus.on(ProjectEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить список проектов. Попробуйте обновить страницу или возвращайтесь позднее');
        });
    } catch (err) {
        console.log(err);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const promoApi = new PromoApi();
    const promoStore = new PromoStore({api: promoApi, bus: bus});

    const carousel = createPromoCarousel(registry, bus);
    promoStore.load();

    const projectApi = new ProjectApi();
    const projectStore = new ProjectStore({api: projectApi, bus: bus});

    const projectsPreview = createProjectsPreviewContainer(registry, bus);
    projectStore.load();
});