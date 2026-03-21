"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { playClickSound } from '@/lib/audio-utils';

interface ChatWindowProps {
  targetCustomerId: string;
  onClose?: () => void;
  language: 'en' | 'th';
}

export function ChatWindow({ targetCustomerId, onClose, language }: ChatWindowProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesRef = useMemoFirebase(() => {
    if (!db || !targetCustomerId) return null;
    return query(
      collection(db, 'chats', targetCustomerId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [db, targetCustomerId]);

  const { data: messages, isLoading } = useCollection(messagesRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !db) return;

    playClickSound();
    
    // Heuristic: Check if user is staff/admin
    const isStaff = user.email?.includes('staff') || user.email?.includes('admin');

    const msgData = {
      senderId: user.uid,
      senderRole: isStaff ? 'Staff' : 'Customer',
      text: inputText.trim(),
      timestamp: serverTimestamp(),
    };

    const colRef = collection(db, 'chats', targetCustomerId, 'messages');
    addDocumentNonBlocking(colRef, msgData);
    setInputText('');
  };

  if (isMinimized) {
    return (
      <Button 
        onClick={() => { playClickSound(); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 flex items-center justify-center animate-bounce z-50"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[520px] flex flex-col rounded-[32px] overflow-hidden pranz-shadow border-none z-50 animate-in slide-in-from-bottom-10 duration-300 bg-background/95 backdrop-blur-md">
      <CardHeader className="bg-primary p-5 text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-primary rounded-full" />
          </div>
          <div>
            <h3 className="font-headline text-xl leading-none flex items-center gap-1.5">
              SAVOR Chat <Sparkles className="w-3.5 h-3.5 text-accent" />
            </h3>
            <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">
              {language === 'en' ? 'Support & Service' : 'ฝ่ายบริการและดูแลลูกค้า'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white rounded-full" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white rounded-full" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
            {language === 'en' ? 'Connecting to owner...' : 'กำลังติดต่อเจ้าของร้าน...'}
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary/30" />
            </div>
            <p className="text-sm font-medium mb-1">
              {language === 'en' ? 'Hi there!' : 'สวัสดีค่ะ!'}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {language === 'en' ? 'Ask us anything about your order.' : 'มีคำถามเรื่องออเดอร์ หรือต้องการบริการเพิ่มเติม ทักหาเจ้าของร้านได้เลยค่ะ'}
            </p>
          </div>
        ) : (
          messages?.map((msg: any) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] p-3.5 rounded-[24px] text-sm pranz-shadow",
                  isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground rounded-tl-none border border-muted"
                )}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                   <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                      {msg.senderRole}
                   </span>
                   {msg.timestamp && (
                     <span className="text-[8px] text-muted-foreground/50">
                        • {new Date(msg.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <CardFooter className="p-4 bg-white border-t border-muted/50">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center">
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'en' ? "Message to owner..." : "พิมพ์ข้อความหาเจ้าของร้าน..."}
            className="flex-1 rounded-full border-none bg-background pranz-shadow h-12 text-sm focus-visible:ring-accent"
          />
          <Button type="submit" size="icon" className="rounded-full bg-accent hover:bg-accent/90 h-12 w-12 shrink-0 pranz-shadow transition-transform active:scale-90">
            <Send className="w-5 h-5 text-white" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
