
export class DndZone {
    constructor({wrapper, dndzone}) {
        this.wrapper = wrapper;
        this.zone = dndzone;
        this.dragCounter = 0;
        this.isDraggingFile = false;
        this.filesDropped = null;

        document.addEventListener('dragenter', (event) => this.enterEvent(event));
        document.addEventListener('drop', (event) => { this.dragCounter = 0; this.leaveEvent(event); });
        document.addEventListener('dragleave', (event) => this.leaveEvent(event));
        document.addEventListener('dragover', (event) => this.overEvent(event));

        this.wrapper.addEventListener('drop', (event) => this.dropEvent(event));
    }

    enterEvent(event) {
        if (this.transfersHasFiles(event)) {
            this.dragCounter++;
            this.showDropZone();
        }
    }

    leaveEvent(event) {
        this.dragCounter--;
        if (this.dragCounter <= 0) {
            this.dragCounter = 0;
            this.hideDropZone();
            event.preventDefault();
        }
    }

    dropEvent(event) {
        event.preventDefault();
        this.dragCounter = 0;
        this.hideDropZone();

        const files = event.dataTransfer.files;
        if (this.filesDropped !== null)
            this.filesDropped(files);
    }

    overEvent(event) {
        if (this.transfersHasFiles(event)) 
            event.preventDefault();
    }

    showDropZone() {
        this.zone.classList.remove('hidden');
    }

    hideDropZone() {
        this.zone.classList.add('hidden');
    }

    transfersHasFiles(event) {
        return event.dataTransfer.types.includes('Files');
    }
}