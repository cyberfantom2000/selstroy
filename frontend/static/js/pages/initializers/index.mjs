import { CarouselConfig, ImageCarousel } from '../../common/carousel.mjs';
import { ProjectsPreviewConfig, ProjectsPreview } from '../projects/projectpreview.mjs';
import { requestAllPromos } from '../api/promotion.mjs';
import { requestAllProjectsShortDescription } from '../../api/project.mjs';

document.addEventListener("DOMContentLoaded", () => {
    const promo_carousel_config = new CarouselConfig({
        async_loader: requestAllPromos,
        image_field: 'image',
        ref_field: '/promo',
        one_ref: true,
        with_buttons: false,
        img_as_ref: true,
        auto_play: true,
        auto_play_interval_secs: 15,
        retry_interval_secs: 5
    });

    const promo_carousel = new ImageCarousel({
        config: promo_carousel_config, 
        container_id: 'promo-carousel'
    });

    const projects_preview_config = new ProjectsPreviewConfig({
        async_loader: requestAllProjectsShortDescription,
        retry_interval_secs: 5
    });

    const projects_preview = new ProjectsPreview({
        config: projects_preview_config,
        container_id: 'projects-container'
    });
});