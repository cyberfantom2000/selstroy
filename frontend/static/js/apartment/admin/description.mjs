
export class AdminApartmentDescription {
    constructor(element) {
        this.square = element.querySelector('[name="square"]');
        this.type = element.querySelector('[name="type"]');
        this.totalFloors = element.querySelector('[name="total-floors"]');
        this.slug = element.querySelector('[name="slug"]');
        this.pdfUrl = element.querySelector('[name="pdf-url"]');
        this.editButton = element.querySelector('[name="edit-button"]');

        this.editClicked = null;
        this.editButton.onclick = () => { if (this.editClicked) this.editClicked(); };
    }

    update(data) {
        this.square.textContent = data.square ?? '';
        this.type.textContent = data.type ?? '';
        this.totalFloors.textContent = data.totalFloors ?? '';
        this.slug.textContent = data.slug ?? '';

        this.pdfUrl.href = data.pdfUrl ?? '';
        this.pdfUrl.textContent = data.pdfUrl ? "Карточка PDF" : "Карточка PDF (Не задана)"
    }
}