import aiosmtplib
from email.message import EmailMessage

from common import settings, get_logger
from .exceptions import SmtpError
from .models import Recall, Message


log = get_logger(settings, 'SMTP')

simple_recall_template = 'Пользователь {name} оставил заявку на обратный звонок. Номер: {phone}'
html_recall_template = '<html><body><p>Пользователь <b>{name}</b> оставил заявку на обратный звонок. <b>Номер</b>: {phone}</p></body></html>'

simple_message_template = '''
Пользователь {name} оставил обращение:
Тема: {subject}
Текст обращения:
{body}
E-mail для ответа: {email}
'''

html_message_template = """
<html>
    <body>
        <p>Пользователь <b>{name}</b> оставил обращение:</p>
        <p><b>Тема:</b> {subject}</p>
        <p><b>Текст обращения:</b><br>{body}</p>
        <p><b>E-mail для ответа:</b> {email}</p>
    </body>
</html>
"""



class SmtpClient:
    async def send_recall_request(self, recall: Recall):
        email_message = EmailMessage()
        email_message['From'] = settings.smtp_sender
        email_message['To'] = settings.smtp_receiver
        email_message['Subject'] = 'Запрос обратного звонка'
        email_message.set_content(simple_recall_template.format(name=recall.name, phone=recall.phone))
        email_message.add_alternative(html_recall_template.format(name=recall.name, phone=recall.phone), subtype='html')
        await self.send(email_message)

    async def send_message_request(self, message: Message):
        email_message = EmailMessage()
        email_message['From'] = settings.smtp_sender
        email_message['To'] = settings.smtp_receiver
        email_message['Subject'] = 'Вопросы и предложения'
        email_message.set_content(
            simple_message_template.format(
                name=message.name, subject=message.subject, body=message.body, email=message.email
            )
        )
        email_message.add_alternative(
            html_message_template.format(
                name=message.name, subject=message.subject, body=message.body, email=message.email
            ),
            subtype='html'
        )
        await self.send(email_message)

    @staticmethod
    async def send(message):
        try:
            log.info(f'Sending message from {message["From"]} to {message["To"]}')
            await aiosmtplib.send(message,
                                  hostname=settings.smtp_host,
                                  port=settings.smtp_port,
                                  username=settings.smtp_username,
                                  password=settings.smtp_password,
                                  start_tls=True)
            log.info('Message was sent')
        except aiosmtplib.SMTPException as err:
            log.error(f'Failed to send message: {err}')
            raise SmtpError(err.message)