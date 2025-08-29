"use client"

import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookableContext } from "@/context/BookableContext";
import { ActionType } from "@/reducers/BookableReducer";
import Bookables from "@/services/Bookables";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { IBookable } from "@/models/IBookable";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1." }),
  description: z.string().min(2, { message: "Description must be at least 2 characters." }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Color must be a hex like #RRGGBB." }),
});

type FormValues = z.infer<typeof formSchema>;

const initialState: IBookable = {
  title: "",
  price: 1,
  description: "",
  color: "#000000",
};

export default function CreateBookableForm() {
  const { token } = useAuth()
  const { bookable, dispatch } = useContext(BookableContext);

  // Set form default values from reducer
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: bookable.title || "",
      price: bookable.price || 1,
      description: bookable.description || "",
      color: bookable.color || "#000000",
    },
  });

  // Sync form when bookable changes (for edit mode)
  useEffect(() => {
    form.reset({
      title: bookable.title || "",
      price: bookable.price || 1,
      description: bookable.description || "",
      color: bookable.color || "#000000",
    });
  }, [bookable, form]);

  const onSubmit = async (values: FormValues) => {
    const bookablesService = new Bookables();
    try {
      if (bookable.uuid != "" && bookable.uuid) {
        await bookablesService.updateBookable(bookable.uuid, values as IBookable, token!);
        alert("Bookable updated!");
      } else {
        await bookablesService.createBookable(values as IBookable, token!);
        alert("Bookable created!");
      }
      handleSwitchToCreate();
    } catch (err) {
      alert("Failed to save bookable");
      console.error(err);
    }
  };

  const handleSwitchToCreate = () => {
    dispatch({ type: ActionType.SET_TITLE, payload: "" });
    dispatch({ type: ActionType.SET_PRICE, payload: "1" });
    dispatch({ type: ActionType.SET_DESCRIPTION, payload: "" });
    dispatch({ type: ActionType.SET_COLOR, payload: "#000000" });
    dispatch({ type: ActionType.SET_UUID, payload: "" });
  };

  return (
    <div className="max-w-md mx-auto">
      {bookable.uuid && (
        <Button
          variant="outline"
          className="mb-4 w-full"
          onClick={handleSwitchToCreate}
        >
          Switch to Create New Bookable
        </Button>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border-1 rounded-lg shadow-sm border-grey p-10">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Bookable title"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              {...form.register("price", { valueAsNumber: true })}
              min={1}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Short description"
              required
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              {...form.register("color")}
              className="w-12 h-12 p-0 border-0 shadow-none"
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          {bookable.uuid ? "Update Bookable" : "Create Bookable"}
        </Button>
      </form>
    </div>
  );
}
