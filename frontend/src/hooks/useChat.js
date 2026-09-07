import { useEffect, useRef, useState } from 'react';
import API from '../api/axios';
import socket from '../socket';

export const chatId = (value) =>
  String(value?._id || value?.id || value || '');

const sortConversations = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b.lastMessageAt || 0) -
      new Date(a.lastMessageAt || 0)
  );

const mergeMessages = (items) =>
  [
    ...new Map(
      items.map((item) => [chatId(item), item])
    ).values(),
  ].sort(
    (a, b) =>
      new Date(a.createdAt) -
      new Date(b.createdAt)
  );

export default function useChat(user) {
  const userId = chatId(user);

  const [conversations, setConversations] =
    useState([]);
  const [activeConvo, setActiveConvo] =
    useState(null);
  const [messages, setMessages] =
    useState([]);

  const activeId = useRef('');
  const selection = useRef(0);
  const revision = useRef(0);
  const seen = useRef(new Set());
  const deleted = useRef(new Set());

  const removeConversation = (value) => {
    const id = chatId(value);

    deleted.current.add(id);
    revision.current += 1;

    setConversations((prev) =>
      prev.filter(
        (item) => chatId(item) !== id
      )
    );

    if (activeId.current === id) {
      activeId.current = '';
      selection.current += 1;

      setActiveConvo(null);
      setMessages([]);
    }
  };

  const deleteConversation = async (convo) => {
    const id = chatId(convo);

    try {
      await API.delete(
        `/conversations/${id}`
      );
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(
          'Failed to delete conversation',
          err
        );
        throw err;
      }
    }

    removeConversation(id);
  };

  const markRead = async (id) => {
    try {
      await API.patch(
        `/conversations/${id}/read`
      );

      revision.current += 1;

      setConversations((prev) =>
        prev.map((item) =>
          chatId(item) === id
            ? {
                ...item,
                unreadCount: 0,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        'Failed to mark messages as read',
        err
      );
    }
  };

  useEffect(() => {
    if (!userId) return;

    let disposed = false;

    const refresh = async () => {
      try {
        let version;
        let res;

        do {
          version = revision.current;

          res = await API.get(
            '/conversations'
          );
        } while (
          !disposed &&
          version !== revision.current
        );

        if (disposed) return;

        setConversations(
          sortConversations(
            res.data.filter(
              (item) =>
                !deleted.current.has(
                  chatId(item)
                )
            )
          )
        );

        if (
          activeId.current &&
          !res.data.some(
            (item) =>
              chatId(item) ===
              activeId.current
          )
        ) {
          removeConversation(
            activeId.current
          );
        }

        if (activeId.current) {
          const id = activeId.current;
          const request =
            selection.current;

          const history =
            await API.get(
              `/conversations/${id}/messages`
            );

          if (
            !disposed &&
            request === selection.current
          ) {
            setMessages((prev) =>
              mergeMessages([
                ...history.data,
                ...prev,
              ])
            );

            await markRead(id);
          }
        }
      } catch (err) {
        console.error(
          'Failed to refresh conversations',
          err
        );
      }
    };

    const onMessage = (
      message,
      details
    ) => {
      const conversationId =
        chatId(message.conversation);

      if (
        deleted.current.has(
          conversationId
        )
      ) {
        return;
      }

      const messageId =
        chatId(message);

      if (
        seen.current.has(messageId)
      ) {
        return;
      }

      seen.current.add(messageId);
      revision.current += 1;

      const incoming =
        typeof message.isMine ===
        'boolean'
          ? !message.isMine
          : chatId(message.sender) !==
            userId;

      const isOpen =
        activeId.current ===
        conversationId;
      const shouldIncrementUnread =
        incoming &&
        !isOpen &&
        message.isRead !== true;

      if (isOpen) {
        setMessages((prev) =>
          mergeMessages([
            ...prev,
            message,
          ])
        );

        if (incoming) {
          void markRead(
            conversationId
          );
        }
      }

      setConversations((prev) => {
        const existing =
          prev.find(
            (item) =>
              chatId(item) ===
              conversationId
          );

        if (
          !existing &&
          !details
        ) {
          return prev;
        }

        const convo =
          existing || {
            ...details,
            unreadCount: 0,
          };

        const newer =
          !convo.lastMessageAt ||
          new Date(
            message.createdAt
          ) >=
            new Date(
              convo.lastMessageAt
            );

        const updated = {
          ...convo,

          ...(newer
            ? {
                lastMessage:
                  message.text,
                lastMessageAt:
                  message.createdAt,
              }
            : {}),

          unreadCount: isOpen
            ? 0
            : (convo.unreadCount || 0) +
              (shouldIncrementUnread ? 1 : 0),
        };

        return sortConversations([
          updated,
          ...prev.filter(
            (item) =>
              chatId(item) !==
              conversationId
          ),
        ]);
      });
    };

    const onError = (err) =>
      console.error(
        'Chat connection failed',
        err.message
      );

    socket.auth = {
      token:
        localStorage.getItem(
          'token'
        ),
    };

    socket.on(
      'connect',
      refresh
    );

    socket.on(
      'newMessage',
      onMessage
    );

    socket.on(
      'conversationDeleted',
      removeConversation
    );

    socket.on(
      'connect_error',
      onError
    );

    socket.connect();

    return () => {
      disposed = true;

      socket.off(
        'connect',
        refresh
      );

      socket.off(
        'newMessage',
        onMessage
      );

      socket.off(
        'conversationDeleted',
        removeConversation
      );

      socket.off(
        'connect_error',
        onError
      );

      socket.disconnect();
    };
  }, [userId]);

  const openConversation = async (
    convo
  ) => {
    const id = chatId(convo);

    if (
      deleted.current.has(id)
    ) {
      return;
    }

    const request =
      ++selection.current;

    activeId.current = id;

    setActiveConvo(convo);
    setMessages([]);

    try {
      const res = await API.get(
        `/conversations/${id}/messages`
      );

      if (
        request !==
        selection.current
      ) {
        return;
      }

      setMessages((prev) =>
        mergeMessages([
          ...res.data,
          ...prev,
        ])
      );

      await markRead(id);
    } catch (err) {
      console.error(
        'Failed to fetch messages',
        err
      );
    }
  };

  const sendMessage = (text) => {
    if (
      !socket.connected ||
      !activeId.current ||
      !text.trim()
    ) {
      return false;
    }

    socket.emit(
      'sendMessage',
      {
        conversationId:
          activeId.current,
        text: text.trim(),
      },
      (result) => {
        if (result?.error) {
          console.error(
            'Failed to send message',
            result.error
          );
        }
      }
    );

    return true;
  };

  const isMyMessage = (message) => {
    // Backend isMine ko priority do
    if (
      typeof message.isMine ===
      'boolean'
    ) {
      return message.isMine;
    }

    // Fallback old messages ke liye
    return (
      Boolean(userId) &&
      chatId(message.sender) ===
        userId
    );
  };

  return {
    conversations,
    activeConvo,
    messages,
    openConversation,
    sendMessage,
    deleteConversation,
    isMyMessage,
  };
}