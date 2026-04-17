from sqlmodel import SQLModel


class Recall(SQLModel):
    phone: str
    name: str | None


class Message(SQLModel):
    name: str
    email: str
    subject: str
    body: str | None
