"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useContext, useState } from "react"
import { BookableContext } from "@/context/BookableContext"
import { ActionType } from "@/reducers/BookableReducer"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { IBookable } from "@/models/IBookable"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  price: z.coerce
    .number()
    .min(1, { message: "Price must be at least 1." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Color must be a hex like #RRGGBB." }),
})

type FormValues = z.infer<typeof formSchema>

export function CreateBookableForm() {
  const { bookable, dispatch } = useContext(BookableContext);
   const [list, setList] = useState<IBookable[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: bookable.title,
      price: bookable.price,
      description: bookable.description,
      color: bookable.color || "#000000",
    },
    mode: "onSubmit",
  })

  const handleFieldChange = (name: keyof FormValues, value: string | number) => {
    switch (name) {
      case "title":
        dispatch({ type: ActionType.SET_TITLE, payload: value as string })
        break
      case "price":
        dispatch({ type: ActionType.SET_PRICE, payload: String(value) })
        break
      case "description":
        dispatch({ type: ActionType.SET_DESCRIPTION, payload: value as string })
        break
      case "color":
        dispatch({ type: ActionType.SET_COLOR, payload: value as string })
        break
    }
  }

  function onSubmit(values: FormValues) {
    console.log("Submitted values:", values)
    // create bookable
    setList([...list, values]);
    console.log(list) 

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border-1 rounded-lg shadow-sm border-grey p-10">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="My bookable"
                  {...field}
                  value={bookable.title}
                  onChange={e => {
                    field.onChange(e)
                    handleFieldChange("title", e.target.value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  value={bookable.price}
                  onChange={e => {
                    const value = e.target.valueAsNumber
                    field.onChange(e)
                    handleFieldChange("price", value)
                  }}
                  placeholder="10"
                />
              </FormControl>
              <FormDescription>Enter a whole number (e.g., 10).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Short description"
                  {...field}
                  value={bookable.description}
                  onChange={e => {
                    field.onChange(e)
                    handleFieldChange("description", e.target.value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input
                  type="color"
                  className="w-10 h-10 p-0 border-0 shadow-none"
                  {...field}
                  value={bookable.color || "#000000"}
                  onChange={e => {
                    field.onChange(e)
                    handleFieldChange("color", e.target.value)
                  }}
                />
              </FormControl>
              <FormDescription>Pick a color for this bookable.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
