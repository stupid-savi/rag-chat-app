"use client"; // Ensures the code runs on the client-side in Next.js

import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import MarkdownPreview from '@uiw/react-markdown-preview';

interface Message {
    id: string | number,
    content: string,
    sender: string
}


const askQuestion = async (input: string, setMessages: Dispatch<SetStateAction<Message[]>>, setLoading: Dispatch<SetStateAction<boolean>>) => {
    try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch the stream');
        }
        const id = Date.now()
        const reader = (response.body!).getReader();
        const decoder = new TextDecoder();
        let done = false;
        let result = '';
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunk = decoder.decode(value, { stream: true });
            result += chunk;
            setMessages((prevMessages) => {
                const updatedMsg = prevMessages.filter((msg) => msg.id !== id)
                return [...updatedMsg, { id, content: result, sender: 'bot' }]
            })
        }
    } catch (error) {
        console.error('Error while streaming data:', error);
    } finally {
        setLoading(false)
    }
};


const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const chatRef = useChatScroll(messages)
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false)

    const handleSend = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                content: input,
                sender: "user",
            },
        ]);
        setInput("");
        askQuestion(input, setMessages, setLoading);
    };

    return (
        <div>
            <div className="flex-grow overflow-y-auto h-screen bg-slate-50" ref={chatRef}>
                <div className="px-4 pb-36">
                    <div className="w-screen px-4 md:px-12 mx-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex",
                                    message.sender === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex gap-3 max-w-[80%]",
                                        message.sender === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {message.sender === "bot" ? (
                                        <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0 rounded-full">
                                            <Image src="/agent.png" alt="Agent" width={32} height={32} />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                            <Image src="/user.jpg" alt="User" width={32} height={32} />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "rounded-2xl p-4",
                                            message.sender === "user" ? "bg-white border" : "bg-white border"
                                        )}
                                    >
                                        <MarkdownPreview source={message.content} />

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-none p-2 bg-white border-t sticky bottom-0 z-10">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto h-full flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[40px] max-h-[120px] resize-none flex-grow"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (e.metaKey || e.ctrlKey) {
                                    (e as unknown as ChangeEvent<HTMLTextAreaElement>).target.value += "\n";
                                } else {
                                    e.preventDefault();
                                    handleSend(e as unknown as FormEvent<HTMLFormElement>);
                                }
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 h-12 w-12"
                    >
                        {!loading ? <Send className="h-4 w-4" /> :
                            <LoaderCircle className="animate-spin" />
                        }
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
