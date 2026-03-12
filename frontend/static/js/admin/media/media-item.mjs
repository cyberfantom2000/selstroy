import { mediaUrl } from "../../api/base-urls.mjs";


function isImageExt(ext) {
    return ['.png', '.jpg', '.jpeg'].includes(ext);
}


export class MediaItem {
    constructor({template, data}) {
        this.data = data;
        this.fragment = template.content.cloneNode(true);
        this.element = this.fragment.firstElementChild;
        this.title = this.fragment.querySelector('[name="title"]');
        this.img = this.fragment.querySelector('img');
        this.imagePlaceholder = this.fragment.querySelector('[name="image-placeholder"]');
        this.basePlaceholder = this.fragment.querySelector('[name="base-placeholder"]');
        this.copyButton = this.fragment.querySelector('[name="copy-button"]');
        this.linkButton = this.fragment.querySelector('[name="link-button"]');
        this.downloadButton = this.fragment.querySelector('[name="download-button"]');
        this.deleteButton = this.fragment.querySelector('[name="delete-button"]');

        this.loaded = false;
        this.relativeLink = null;
        this.absoluteLink = null;
        this.isImage = false;

        this.clicked = null;
        this.copyClicked = null;
        this.linkClicked = null;
        this.downloadClicked = null;
        this.deleteClicked = null;

        this.imagePlaceholder.onclick = () => { if(this.clicked) this.clicked(this); };
        this.basePlaceholder.onclick = () => { if(this.clicked) this.clicked(this); };
        this.copyButton.onclick = () => { if(this.copyClicked) this.copyClicked(this); };
        this.linkButton.onclick = () => { if(this.linkClicked) this.linkClicked(this); };
        this.downloadButton.onclick = () => { if(this.downloadClicked) this.downloadClicked(this); };
        this.deleteButton.onclick = () => { if(this.deleteClicked) this.deleteClicked(this); };

        this.update(data);
    }

    update(data) {
        this.data = data;
        const name = data.name ?? 'unknown';
        const ext = data.ext ?? '';
        this.title.textContent = name + ext;
        this.title.title = name + ext;

        this.isImage = isImageExt(ext);
        this.setImagePlaceholderVisible(this.isImage);
        this.setBasePlaceholderVisible(!this.isImage);

        if (this.isImage)
            this.img.src = `${mediaUrl}/${data.id}`;

        this.loaded = Boolean(data.id);
        if (this.loaded) {
            this.relativeLink = `${mediaUrl}/${data.id}`;
            this.absoluteLink = window.location.origin + this.relativeLink;
        }
    }

    setImagePlaceholderVisible(visible) {
        if (visible)
            this.imagePlaceholder.classList.remove('hidden');
        else
            this.imagePlaceholder.classList.add('hidden')
    }

    setBasePlaceholderVisible(visible) {
        if (visible)
            this.basePlaceholder.classList.remove('hidden');
        else
            this.basePlaceholder.classList.add('hidden')
    }

    setButtonsEnabled(enaled) {
        this.copyButton.enaled = enaled;
        this.linkButton.enaled = enaled;
        this.deleteButton.enabled = enaled;
        this.downloadButton.enabled = enaled;
    }
}