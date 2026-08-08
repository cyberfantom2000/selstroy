import { ApiUrls } from "./base-urls.mjs";
import { extractErrorMessage } from "./model.mjs";


export class FeedbackApi {
    async sendMessage(data) {
        const resp = await fetch(`${ApiUrls.feedback}/message`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'accept': 'application/json',
                'Content-type': 'application/json'
            }
        });

        if (!resp.ok) {
            const error = await extractErrorMessage(resp);
            throw new Error(error);
        }

        try {
            return await resp.json();
        } catch (err) {
            console.error('Failed to parse server response:', err);
            throw new Error('Failed to parse server response');
        }
    }

    async sendRecall(data) {
        const resp = await fetch(`${ApiUrls.feedback}/recall`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'accept': 'application/json',
                'Content-type': 'application/json'
            }
        });

        if (!resp.ok) {
            const error = await extractErrorMessage(resp);
            throw new Error(error);
        }

        try {
            return await resp.json();
        } catch (err) {
            console.error('Failed to parse server response:', err);
            throw new Error('Failed to parse server response');
        }
    }
}