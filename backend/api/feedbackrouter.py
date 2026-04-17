from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..feedback import Recall, Message, SmtpClient


class FeedbackRouter:
    def __init__(self, smtp_client: SmtpClient, *args, **kwargs):
        self.router = APIRouter(*args, **kwargs)
        self.smtp_client = smtp_client

        self.router.add_api_route('/recall', self.recall, methods=['POST'])
        self.router.add_api_route('/message', self.message, methods=['POST'])

    async def recall(self, recall: Recall) -> JSONResponse:
        await self.smtp_client.send_recall_request(recall)
        return JSONResponse(content={'result': 'success'})

    async def message(self, message: Message) -> JSONResponse:
        await self.smtp_client.send_message_request(message)
        return JSONResponse(content={'result': 'success'})

    def __str__(self):
        """ To debug output """
        return f'Name: {self.__class__.__name__}'