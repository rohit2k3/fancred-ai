// src/components/ai/AiAssistant.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Sparkles, Bot, UserCircle, AlertTriangle, SendHorizonal, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string | string[];
  type?: 'analysis' | 'suggestion' | 'general';
}

const AiAssistant = () => {
  const { 
    superfanScore, 
    aiSuggestions, 
    fetchAiSuggestions, 
    isLoadingAiSuggestions, 
    isWalletConnected,
    fanAnalysis,
    fetchFanAnalysis,
    isLoadingFanAnalysis
  } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiSuggestions.length > 0 && !messages.find(m => m.type === 'suggestion' && m.text === aiSuggestions)) {
      setMessages(prev => [...prev, { id: `sugg-${Date.now()}`, sender: 'ai', text: aiSuggestions, type: 'suggestion' }]);
    }
  }, [aiSuggestions, messages]);
  
  useEffect(() => {
    if (fanAnalysis && !messages.find(m => m.type === 'analysis' && m.text === fanAnalysis)) {
      setMessages(prev => [...prev, { id: `analysis-${Date.now()}`, sender: 'ai', text: fanAnalysis, type: 'analysis' }]);
    }
  }, [fanAnalysis, messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!isWalletConnected) {
       setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: "Please connect your wallet to use the AI Assistant." }]);
      return;
    }
    const userMessage = inputMessage.trim();
    if (!userMessage) {
        // If no input, default to fetching suggestions if not already present or loading
        if (!isLoadingAiSuggestions && !messages.some(msg => msg.type === 'suggestion')) {
            await fetchAiSuggestions();
        }
        return;
    }

    setMessages(prev => [...prev, { id: (Date.now()-1).toString(), sender: 'user', text: userMessage, type: 'general' }]);
    setInputMessage('');
    // Basic command handling
    if (userMessage.toLowerCase().includes("improve my score") || userMessage.toLowerCase().includes("suggestions")) {
        await fetchAiSuggestions();
    } else if (userMessage.toLowerCase().includes("analyze my profile") || userMessage.toLowerCase().includes("fan analysis")) {
        await fetchFanAnalysis();
    } else {
        // For other messages, you might have a general purpose AI chat flow (not implemented here)
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "I can help with score improvement suggestions and fan analysis. What would you like to know?", type: 'general' }]);
    }
  };
  
  const handleRequestAnalysis = async () => {
    if (!isWalletConnected) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: "Please connect your wallet to request analysis." }]);
        return;
    }
    setMessages(prev => [...prev, { id: (Date.now()-1).toString(), sender: 'user', text: "Can you analyze my fan profile?", type: 'general' }]);
    await fetchFanAnalysis();
  };

  const handleRequestSuggestions = async () => {
     if (!isWalletConnected) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: "Please connect your wallet to request suggestions." }]);
        return;
    }
    setMessages(prev => [...prev, { id: (Date.now()-1).toString(), sender: 'user', text: "How can I improve my FanCred score?", type: 'general' }]);
    await fetchAiSuggestions();
  }

  const predefinedQuestionSuggestion = "How can I improve my FanCred score?";
  const predefinedQuestionAnalysis = "Analyze my fan profile";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full flex flex-col max-h-[700px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">AI Fan Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === 'user' ? 'bg-primary text-primary-foreground' 
                    : msg.sender === 'system' ? 'bg-destructive/20 text-destructive-foreground'
                    : 'bg-muted text-foreground'
                  }`}>
                  {msg.sender === 'ai' && <Bot className="h-5 w-5 mb-1 text-accent inline-block mr-2" />}
                  {msg.sender === 'user' && <UserCircle className="h-5 w-5 mb-1 inline-block mr-2" />}
                  {msg.sender === 'system' && <AlertTriangle className="h-5 w-5 mb-1 text-destructive inline-block mr-2" />}
                  
                  {msg.type === 'analysis' && <strong className="block mb-1 font-semibold text-accent">Fan Analysis:</strong>}
                  {msg.type === 'suggestion' && <strong className="block mb-1 font-semibold text-accent">Improvement Suggestions:</strong>}

                  {Array.isArray(msg.text) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {msg.text.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            {(isLoadingAiSuggestions || isLoadingFanAnalysis) && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-muted flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  <p>AI is thinking...</p>
                </div>
              </div>
            )}
            {messages.length === 0 && !isLoadingAiSuggestions && !isLoadingFanAnalysis && (
                <div className="text-center text-muted-foreground p-6">
                    <Bot size={48} className="mx-auto mb-2" />
                    <p>Ask me anything about improving your FanCred!</p>
                    <p className="text-xs mt-1">e.g., "{predefinedQuestionSuggestion}" or "{predefinedQuestionAnalysis}"</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t flex-col items-stretch gap-2">
        <div className="flex w-full items-start gap-2">
          <Textarea
            placeholder={`Ask about your score of ${superfanScore} or type a command...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-grow resize-none min-h-[40px]"
            rows={1}
            aria-label="Your message to AI Assistant"
            disabled={!isWalletConnected || isLoadingAiSuggestions || isLoadingFanAnalysis}
          />
          <Button onClick={handleSendMessage} disabled={!isWalletConnected || isLoadingAiSuggestions || isLoadingFanAnalysis} aria-label="Send message">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleRequestSuggestions} disabled={!isWalletConnected || isLoadingAiSuggestions}>
                <Sparkles className="mr-2 h-4 w-4" /> Get Score Suggestions
            </Button>
            <Button variant="outline" size="sm" onClick={handleRequestAnalysis} disabled={!isWalletConnected || isLoadingFanAnalysis}>
                <FileText className="mr-2 h-4 w-4" /> Get Fan Analysis
            </Button>
        </div>
      </CardFooter>
        {!isWalletConnected && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-semibold text-center mb-2">Wallet Not Connected</p>
                <p className="text-sm text-muted-foreground text-center">Please connect your wallet to interact with the AI Fan Assistant.</p>
            </div>
        )}
    </Card>
  );
};

export default AiAssistant;
