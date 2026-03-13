import { mediaUrl } from "../../api/base-urls.mjs";


export class PromoItem {
    constructor({basePromoTemplate, adminPromoTemplate, data}) {
        this.fragment = adminPromoTemplate.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;
        this.editButton = this.fragment.querySelector('[name="edit-button"]');
        this.draftButton = this.fragment.querySelector('[name="draft-button"]');
        this.deleteButton = this.fragment.querySelector('[name="delete-button"]');

        const promoFragment = basePromoTemplate.content.cloneNode(true);
        this.img = promoFragment.querySelector('img');
        this.description = promoFragment.querySelector('[name="description"]');

        const previewContainer = this.fragment.querySelector('[name="preview-container"]');
        previewContainer.appendChild(promoFragment);

        this.editClicked = null;
        this.draftClicked = null;
        this.deleteClicked = null;

        this.editButton.onclick = () => { if (this.editClicked) this.editClicked(this); };
        this.draftButton.onclick = () => { if (this.draftClicked) this.draftClicked(this); };
        this.deleteButton.onclick = () => { if (this.deleteClicked) this.deleteClicked(this); };

        this.update(data);
    }

    update(data) {
        this.data = data;

        this.img.src = `${mediaUrl}/${data.image.id}`
        this.description.innerHTML = data.text;

        this.setDraftButtonSelect(data.is_draft);
    }

    setDraftButtonSelect(select) {
        if (select)
            this.draftButton.classList.add('text-primary-500', 'dark:text-primary-500');
        else
            this.draftButton.classList.remove('text-primary-500', 'dark:text-primary-500');
    }

    setButtonsEnabled(enaled) {
        this.editButton.enaled = enaled;
        this.draftButton.enaled = enaled;
        this.deleteButton.enabled = enaled;
    }
}