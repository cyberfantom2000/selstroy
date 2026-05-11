import { registry, bus } from "./base.mjs";

import { PopupEvents, GalleryEvents } from "../../core/events.mjs";

import {GalleryApi} from "../../api/gallery.mjs";
import {GalleryStore} from "../../store/gallery.mjs";

import { GalleryContainer } from "../gallery/gallery-container.mjs";
import { GalleryPreview } from "../../components/gallery-preview.mjs";


function createGalleryContainer(registry, bus) {
    try {
        registry.register('gallery-container', '#gallery-container');
        registry.register('gallery-item-template', '#gallery-item-template');

        bus.on(GalleryEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить галерею. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        return new GalleryContainer({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
    }
}


function createGalleryPreview(registry, bus) {
    try {
        registry.register('gallery-preview-modal', '#gallery-preview-modal');
        return new GalleryPreview({registry: registry, bus: bus});
    } catch(err) {
        console.log(err);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const galleryApi = new GalleryApi();
    const galleryStore = new GalleryStore({api: galleryApi, bus: bus});

    const galleryContainer = createGalleryContainer(registry, bus);
    const galleryPreview = createGalleryPreview(registry, bus);

    galleryStore.load();
});