import { registry, bus } from "./base.mjs";

import { PopupEvents, ProjectEvents, ApartmentEvents } from "../../core/events.mjs";

import { ProjectApi } from "../../api/project.mjs";
import { ProjectStore } from "../../store/project.mjs";

import { ApartmentApi } from "../../api/apartment.mjs";
import { ApartmentStore } from "../../store/apartment.mjs";

// import { ImageCarousel } from "../../components/carousel.mjs";

// function createImageCarousel(registry, bus) {
//     try {
//         registry.register('carousel-dot-template', '#carousel-dot-template');
//         registry.register('carousel-slide-template', '#carousel-slide-template');
//         registry.register('promo-carousel-container', '#promo-carousel');
//         const carousel = new ImageCarousel({container: registry.get('promo-carousel-container'), registry: registry});

//         bus.on(PromoEvents.Update, (items) => {
//             const slides = items.map((el) => {
//                 return { url: el.imageUrl, href: '/promo' };
//             });

//             carousel.clear();
//             carousel.append(slides);
//             carousel.play(10);
//         });

//         bus.on(PromoEvents.Error, (err) => {
//             console.log(err);
//             bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить изображения. Попробуйте обновить страницу или возвращайтесь позднее');
//         });

//         return carousel;
//     } catch (err) {
//         console.log(err);
//     }
// }



document.addEventListener("DOMContentLoaded", () => {
    const projectApi = new ProjectApi();
    const projectStore = new ProjectStore({api: projectApi, bus: bus});

    const apartmentApi = new ApartmentApi();
    const apartmentStore = new ApartmentStore({api: apartmentApi, bus: bus});
 
    
    
    const path = window.location.pathname;
    const segments = path.split('/').filter(seg => seg !== '');
    const slug = segments[segments.length - 1];

    projectStore.loadBySlug(slug).then(() => {
        // apartmentStore.loadForProject(); 
    });
});