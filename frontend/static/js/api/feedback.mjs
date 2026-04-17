import { feedbackUrl } from "./base-urls.mjs";
import { makeErrorMessage } from "./model.mjs";


export class FeedbackApi {
    async sendMessage(data) {
        const resp = await fetch(`${feedbackUrl}/message`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'accept': 'application/json',
                'Content-type': 'application/json'
            }
        });

        const reply = await resp.json();

        if (!resp.ok)
            throw new Error(makeErrorMessage(resp, reply));

        return reply;
    }

    async sendRecall(data) {
        const resp = await fetch(`${feedbackUrl}/recall`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'accept': 'application/json',
                'Content-type': 'application/json'
            }
        });

        const reply = await resp.json();

        if (!resp.ok)
            throw new Error(makeErrorMessage(resp, reply));

        return reply;
    }
}