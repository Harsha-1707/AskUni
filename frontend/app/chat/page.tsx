'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useChatStore } from '@/lib/store/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ChatPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const { messages, sendMessage, isLoading } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setInput('');
    await sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AskUni Chat</h1>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          )}
          <Button variant="ghost" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-600">
                Ask anything about university admissions, fees, or policies
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.role === 'assistant' && (
                  <>
                    {/* Confidence Score */}
                    {message.confidence_score !== undefined && (
                      <div className="mt-3">
                        <Badge
                          variant={
                            message.confidence_score > 0.7 ? 'default' : 'secondary'
                          }
                        >
                          {Math.round(message.confidence_score * 100)}% confident
                        </Badge>
                      </div>
                    )}

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <Accordion type="single" collapsible className="mt-4">
                        <AccordionItem value="sources">
                          <AccordionTrigger className="text-sm text-gray-600">
                            {message.sources.length} Source(s)
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {message.sources.map((source, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-gray-50 p-3 rounded"
                                >
                                  <p className="font-semibold">{source.source}</p>
                                  <p className="text-gray-600 text-xs mt-1">
                                    Score: {source.score.toFixed(3)}
                                  </p>
                                  <p className="text-gray-700 mt-2">{source.content}</p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Processing Time */}
                    {message.processing_time && (
                      <p className="text-xs text-gray-500 mt-2">
                        {message.processing_time.toFixed(2)}s
                      </p>
                    )}
                  </>
                )}
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-white">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
