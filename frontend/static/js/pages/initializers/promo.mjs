import { registry, bus } from "./base.mjs";

import { PopupEvents, PromoEvents } from "../../core/events.mjs";

import { PromoApi } from "../../api/promo.mjs";
import { PromoStore } from "../../store/promo.mjs";

import { PromoContainer } from "../promo/promo-container.mjs";


function createPromoContainer(registry, bus) {
    try {
        registry.register('promo-container', '#promo-container');
        registry.register('promo-item-base-template', '#promo-item-template');

        bus.on(PromoEvents.Error, (err) => {
            console.log(err);
            bus.emit(PopupEvents.Message.Err.Show, 'Не удалось загрузить акции. Попробуйте обновить страницу или возвращайтесь позднее');
        });

        return new PromoContainer({registry: registry, bus: bus});
    } catch (err) {
        console.log(err);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const promoApi = new PromoApi();
    const promoStore = new PromoStore({api: promoApi, bus: bus});

    const promoContainer = createPromoContainer(registry, bus);

    promoStore.load();
});