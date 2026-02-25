
class SliceOptions {
    constructor({img_src, img_ref = "", btn_link = ""}) {
        this.img_src = img_src;
        this.img_ref = img_ref;
        this.btn_link = btn_link;
    }
}

class Slide {
    constructor(template, options) {
        this.element = template.content.cloneNode(true);
        this.element.querySelector('[name="img-ref"]').href = options.img_ref;
        this.element.querySelector('[name="img"]').src = options.img_src;
        this.container = this.element.querySelector('[name="slide"]');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    show() {
        this.container.classList.remove('hidden');
    }
}

class SlideWithButton extends Slide{
    constructor(template, options) {
        super(template, options);

        this.element.querySelector('[name="btn"]').href = options.btn_link;
    }
}

class DotButton {
    constructor(template) {
        this.element = template.content.cloneNode(true);
        this.onclick = null;

        this.button = this.element.querySelector('button');
        this.button.onclick = () => { if (this.onclick) this.onclick(); }
    }

    select() {
        this.button.classList.remove('bg-white/50');
        this.button.classList.add('bg-white');
    }

    deselect() {
        this.button.classList.add('bg-white/50');
        this.button.classList.remove('bg-white');
    }
}

export class CarouselConfig {
    constructor({async_loader, image_field, ref_field, one_ref = false, with_buttons = false, img_as_ref=false, auto_play = false, auto_play_interval_secs = 10}) {
        this.async_loader = async_loader;
        this.image_field = image_field;
        this.ref_field = ref_field;
        this.one_ref = one_ref;
        this.with_buttons = with_buttons;
        this.img_as_ref = img_as_ref;
        this.auto_play = auto_play;
        this.auto_play_interval_secs = auto_play_interval_secs;
    }
}

export class ImageCarousel {
    constructor({config, container_id}) {
        this.config = config;

        let main_container = document.getElementById(container_id);
        this.slides_track = main_container.querySelector('[name="slides-track"]');
        this.dots_container = main_container.querySelector('[name="dots-container"]');

        this.dot_template = document.getElementById('carousel-dot-template');
        this.slide_with_button_template = document.getElementById('carousel-slide-with-button-template');
        this.slide_without_button_template = document.getElementById('carousel-slide-without-button-template');

        this.slides = [];
        this.dots = []
        this.active_index = null;
        this.interval_id = null;

        this.build().then(() => { 
            this.show_first();
            if (this.config.auto_play)
                this.start_auto_play(this.config.auto_play_interval_secs); 
        });
    }

    //private methods

    async build() {
        let items = await this.config.async_loader();
        for (const item of items) {
            let slide = this.build_slide(item);
            slide.hide();
            this.slides.push(slide);

            let dot = this.build_dot();
            this.dots.push(dot);

            let slide_index = this.slides.length - 1;
            dot.onclick = () => { this.swap_slide(slide_index) };

            this.slides_track.appendChild(slide.element);
            this.dots_container.appendChild(dot.element);
        }
    }

    start_auto_play(interval_secs) {
        if (this.interval_id !== null)
            clearInterval(this.interval_id);

        this.interval_id = setInterval(
            () => { this.swap_slide(this.active_index + 1) },
            interval_secs * 1000
        );
    }

    show_first(){
        if (this.slides.length > 0)
            this.swap_slide(0);
    }

    swap_slide(index){
        if (this.active_index !== null) {
            this.slides[this.active_index].hide();
            this.dots[this.active_index].deselect();
        }

        this.active_index = index % this.slides.length;
        this.slides[this.active_index].show();
        this.dots[this.active_index].select();
    }

    build_slide(item) {
        const href = this.config.one_ref ? this.config.ref_field : item[this.config.ref_field];

        const options = new SliceOptions({
            img_src: '/api/file/' + item[this.config.image_field].id,
            img_link: this.config.img_as_ref ? href : '',
            btn_link: this.with_buttons ? href : ''
        });

        if (this.config.with_buttons)
            return new SlideWithButton(this.slide_with_button_template,  options);
        else
            return new Slide(this.slide_without_button_template, options);
    }

    build_dot() {
        return new DotButton(this.dot_template);
    }
}
