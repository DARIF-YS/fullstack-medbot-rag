from sqlalchemy import JSON, Column, Integer, String, Text, ForeignKey, TIMESTAMP, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    picture = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",  # ✅ supprime tout si User supprimé
        passive_deletes=True
    )

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",  # ✅ supprime les messages si conv supprimée
        passive_deletes=True
    )

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"))
    sender = Column(Enum("user", "assistant"))
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    conversation = relationship("Conversation", back_populates="messages")
    documents = relationship(
        "MessageDocument",
        back_populates="message",
        cascade="all, delete-orphan",  # ✅ supprime docs si message supprimé
        passive_deletes=True
    )

class MessageDocument(Base):
    __tablename__ = "message_documents"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"))
    page_content = Column(Text, nullable=False)
    metadata_info = Column(JSON, nullable=False)  # JSON.stringify({"source": "chemin"})
    
    message = relationship("Message", back_populates="documents")
