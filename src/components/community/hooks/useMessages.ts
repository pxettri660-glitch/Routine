import { useState, useEffect } from 'react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  updateDoc, doc, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Message, Thread, UserProfile } from '../types';
import { useAuth } from '../../../contexts/AuthContext';

export function useMessages(thread: Thread | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!thread || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }
    if (thread.blockedMembers?.includes(user.uid)) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'threads', thread.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach(d => {
        msgs.push({ id: d.id, ...d.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [thread, user]);

  const sendMessage = async (text: string, mediaUrl?: string, mediaType?: 'image' | 'pdf' | 'doc', replyToId?: string) => {
    if (!thread || !user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data() as UserProfile;
      if (userData?.isBanned || userData?.isDisabled) {
        alert("You are not allowed to send messages.");
        return;
      }
    } catch (e) {
      console.warn("Could not fetch user doc for send message:", e);
    }

    if (thread.mutedMembers?.includes(user.uid)) {
      alert("You have been muted in this conversation.");
      return;
    }
    
    if (thread.isLocked && !thread.admins?.includes(user.uid) && !['gwvcfcQqpKgFf8oR6OruOmYm1s82', 'QDkkZtRwlDcdALtsFWEg9HAcgAC2'].includes(user.uid)) {
      alert("This conversation is locked.");
      return;
    }

    try {
      const msgData = {
        threadId: thread.id,
        senderId: user.uid,
        text,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        timestamp: Date.now(),
        isEdited: false,
        isDeleted: false,
        reactions: {},
        readBy: [user.uid],
        replyToId: replyToId || null
      };
      
      await addDoc(collection(db, 'threads', thread.id, 'messages'), msgData);
      
      await updateDoc(doc(db, 'threads', thread.id), {
        lastMessage: {
          text,
          senderId: user.uid,
          timestamp: Date.now()
        },
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message.');
    }
  };

  const editMessage = async (msgId: string, newText: string) => {
    if (!thread) return;
    try {
      await updateDoc(doc(db, 'threads', thread.id, 'messages', msgId), {
        text: newText,
        isEdited: true
      });
    } catch (e) {
      console.error(e);
      alert("Cannot edit this message.");
    }
  };

  const deleteMessage = async (msgId: string) => {
    if (!thread) return;
    try {
      await updateDoc(doc(db, 'threads', thread.id, 'messages', msgId), {
        text: 'This message was deleted.',
        isDeleted: true,
        mediaUrl: null,
        mediaType: null
      });
    } catch (e) {
      console.error(e);
      alert("Cannot delete this message.");
    }
  };
  
  
  const setTypingStatus = async (isTyping: boolean) => {
    if (!thread || !user) return;
    try {
      const currentTyping = thread.typingUsers || [];
      const newTyping = isTyping 
        ? [...new Set([...currentTyping, user.uid])]
        : currentTyping.filter(uid => uid !== user.uid);
        
      await updateDoc(doc(db, 'threads', thread.id), {
        typingUsers: newTyping
      });
    } catch (e) {
      console.warn("Could not update typing status");
    }
  };

  const reactToMessage = async (msgId: string, emoji: string) => {
     if (!thread || !user) return;
     const msg = messages.find(m => m.id === msgId);
     if (!msg) return;
     
     const currentReactions = msg.reactions || {};
     const emojiUsers = currentReactions[emoji] || [];
     
     if (emojiUsers.includes(user.uid)) {
       currentReactions[emoji] = emojiUsers.filter(u => u !== user.uid);
       if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
     } else {
       currentReactions[emoji] = [...emojiUsers, user.uid];
     }
     
     try {
       await updateDoc(doc(db, 'threads', thread.id, 'messages', msgId), {
         reactions: currentReactions
       });
     } catch (e) {
       console.error(e);
     }
  };

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    setTypingStatus
  };
}
