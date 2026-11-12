const FIT_STYLE = `
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
svg {
    display: block;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
}
`;


export function onFrameLoad(frame, callback) {
    frame.addEventListener('load', () => {
        let doc;

        try {
            doc = frame.contentDocument;
        } catch (err) {
            return;
        }

        if (!doc || !doc.head)
            return;

        callback(doc);
    });
}


export function fitFrameContent(frame) {
    onFrameLoad(frame, (doc) => {
        const style = doc.createElement('style');
        style.textContent = FIT_STYLE;
        doc.head.appendChild(style);
    });
}
