"use client"

import { Form, FormControl, FormField, FormItem } from "@/components/form";
import Lucide from "@/components/icon";
import { Input } from "@/components/input";
import { Messages } from "@/interface/content";
import { cn } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Home() {
  const [messages, setMessages] = useState<Messages>([])
  const [openSettings, setOpenSettings] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)


  const formSchema = z.object({
    content: z.string()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', ...values as { content: string } }])

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ',
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            ...values
          }
        ]
      })
    })

    if (response.status == 200) {
      setLoading(false)
      const json = await response.json()
      console.log("🚀 ~ file: page.tsx:58 ~ onSubmit ~ json:", json)
      setMessages(prev => [...prev, { role: 'assistant', content: json.choices[0].message.content }])
      form.reset()
    }
  }

  return (
    <main className="grid grid-cols-12 h-screen">
      <div className="col-span-12 relative p-5 bg-gray-100 pb-20">
        <div className="space-y-5 flex-col flex">
          {messages.map((message, index) => {
            if (message.role == 'assistant') {
              return (
                <div className="inline-flex gap-3" key={index}>
                  <div className='flex-shrink-0 rounded-full h-12 w-12 bg-black flex flex-col items-center justify-center'>
                    <Lucide name='quote' size={23} color="white" fill="white" />
                  </div>
                  <div className="bg-white p-5 rounded-lg overflow-hidden">
                    <p className='porse'>{message.content}</p>
                  </div>
                </div>
              )
            }
            return (
              <div className="bg-gray-200/50 p-5 rounded-lg" key={index}>
                <p>{message.content}</p>
              </div>
            )
          })}
        </div>

        <div className="fixed p-5 bottom-0 w-full right-0 shadow-xl drop-shadow-xl">
          {openSettings && (
            <div className="w-full bg-white mb-5 p-5 rounded-md">
              test
            </div>
          )}
          <div className="inline-flex items-center justify-center space-x-4 w-full">
            <button onClick={(e) => {
              e.preventDefault()
              setOpenSettings(!openSettings)
            }}>
              <Lucide name='settings' size={30} />
            </button>
            <div className="w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="ask me something" className="bg-white h-12" {...field} disabled={loading} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <button className="absolute right-5 top-0 h-full" disabled={loading}>
                    <Lucide name={loading ? 'loader-2' : 'send-horizontal'} className={cn(loading ? 'animate-spin' : '')} size={23} />
                  </button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
