import { registry, bus } from "./base.mjs";

import { PopupEvents, PromoEvents } from "../../core/events.mjs";

import { PromoApi } from "../../api/promo.mjs";
import { PromoStore } from "../../store/promo.mjs";

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
            bus.emit(PopupEvents.Message.Err.Show, 'Не получилось загрузить акции. Обновите страницу или игнорируйте это сообщение');
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
});