import { CarouselConfig, ImageCarousel } from '../templates/carousel.mjs';
import { requestAllPromos } from '../api/promotion.mjs';

document.addEventListener("DOMContentLoaded", () => {
    const promo_carousel_config = new CarouselConfig({
        async_loader: requestAllPromos,
        image_field: 'image',
        ref_field: '/promo',
        one_ref: true,
        with_buttons: false,
        img_as_ref: true,
        auto_play: true,
        auto_play_interval_secs: 15
    });

    const promo_carousel = new ImageCarousel({
        config: promo_carousel_config, 
        container_id: 'promo-carousel'
    });
});