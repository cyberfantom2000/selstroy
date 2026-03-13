const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'is-draft-tooltip': 'Черновик не отображается страницах, видимых пользователю. Подходит для того чтобы временно или постоянно скрыть элемент, не удаляя его.',
    'image-id-tooltip': 'Уникальный индентификатор медиафайла. Необходим для отображения изображения в элементе',
    'description-tooltip': 'Текст акции. Отображается в элементе. Для форматирования текста необходимо использовать html разметку и классы tailwind'
};

export class PromoEditModal {
    constructor({modal, tooltip}) {
        this.modal = modal;
        this.title = this.modal.querySelector('[name="title"]');
        this.id = this.modal.querySelector('[name="id-input"]');
        this.draftCheckbox = this.modal.querySelector('[name="is-draft-input"]');
        this.imageId = this.modal.querySelector('[name="image-id-input"]');
        this.description = this.modal.querySelector('[name="description-input"]');

        this.submitClicked = null;

        const submitButton = this.modal.querySelector('[name="submit-button"]');
        submitButton.onclick = () => { 
            if (this.submitClicked) 
                this.submitClicked(this.data()); 

            this.hide();
        };

        const rejectButton = this.modal.querySelector('[name="reject-button"]');
        rejectButton.onclick = () => this.hide();
        
        const background = this.modal.querySelector('[name="background"]');
        background.onclick = () => this.hide();

        for (const button of this.modal.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => { tooltip.show(tooltips[button.name]); };

        this.escapeHandler = (event) => {
            if (event.key === 'Escape')
              this.hide();
        };
    }

    setTitle(text) {
        this.title.textContent = text;
    }

    setData(data) {
        this.id.textContent = data.id ?? '';
        this.draftCheckbox.checked = data.is_draft ?? false;
        this.imageId.value = data.image ? data.image.id : '';
        this.description.value = data.text ?? '';
    }

    data() {
        let result = {
            is_draft: this.draftCheckbox.checked,
            image_id: this.imageId.value,
            text: this.description.value
        };

        if (this.id.textContent !== '')
            result['id'] = this.id.textContent;

        return result;
    }

    show() {
        this.modal.classList.remove('hidden');
        document.addEventListener('keydown', this.escapeHandler);
    }

    hide() {
        this.modal.classList.add('hidden');
        document.removeEventListener('keydown', this.escapeHandler);
    }
}