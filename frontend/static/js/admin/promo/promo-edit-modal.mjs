import { Modal } from "../../common/modal.mjs";
import { isEmpty, toggleOutlineRed } from "../../common/utils.mjs";


const tooltips = {
    'id-tooltip': 'Уникальный идентификатор элемента. Присваевается автоматически, неизменяемый. Служебная информация, не отображается на сайте.',
    'is-draft-tooltip': 'Черновик не отображается страницах, видимых пользователю. Подходит для того чтобы временно или постоянно скрыть элемент, не удаляя его.',
    'image-id-tooltip': 'Уникальный индентификатор медиафайла. Необходим для отображения изображения в элементе',
    'description-tooltip': 'Текст акции. Отображается в элементе. Для форматирования текста необходимо использовать html разметку и классы tailwind'
};

export class PromoEditModal extends Modal{
    constructor({modal, tooltip}) {
        super(modal);

        this.title = this.element.querySelector('[name="title"]');
        this.id = this.element.querySelector('[name="id-input"]');
        this.draftCheckbox = this.element.querySelector('[name="is-draft-input"]');
        this.imageId = this.element.querySelector('[name="image-id-input"]');
        this.description = this.element.querySelector('[name="description-input"]');

        this.element.querySelector('[name="submit-button"]').onclick = () => this.submit();
        this.element.querySelector('[name="reject-button"]').onclick = () => this.reject();
        this.element.querySelector('[name="background"]').onclick = () => this.reject();

        for (const button of this.element.querySelectorAll('[role="tooltip"]'))
            button.onclick = () => { tooltip.show(tooltips[button.name]); };

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

    clearData() {
        for (const input of this.element.querySelectorAll('input, textarea'))
            toggleOutlineRed(input, false);

        this.setData({});
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

    validate() {
        let ok = true;

        ok &&= !isEmpty(this.imageId.value);
        toggleOutlineRed(this.imageId, isEmpty(this.imageId.value));

        ok &&= !isEmpty(this.description.value);
        toggleOutlineRed(this.description, isEmpty(this.description.value));

        return ok;
    }
}