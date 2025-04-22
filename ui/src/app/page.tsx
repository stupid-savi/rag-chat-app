"use client"
import type React from "react"
import dynamic from "next/dynamic"
import Loader from "@/components/loader/loader"


const Chat = dynamic(() => import('@/components/chat/chat'), {
  loading: () => <Loader />,
  ssr: false
})

const ChatSidebar = () => {

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <div className="flex-none bg-white border-b p-4 h-16 sticky top-0 z-10">
        <span className="font-medium text-base">RAG Chat Application</span>
      </div>
      <Chat />
    </div>
  )
}

export default ChatSidebar

