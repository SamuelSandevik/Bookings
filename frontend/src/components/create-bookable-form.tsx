"use client"

import { useContext, useEffect, useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1." }),
  desc: z.string().min(2, { message: "Description must be at least 2 characters." }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Color must be a hex like #RRGGBB." }),
});

type FormValues = z.infer<typeof formSchema>;

const initialState: IBookable = {
  title: "",
  price: 1,
  desc: "",
  color: "#000000",
};

export default function CreateBookableForm({
  show,
  onClose,
  onSaved, // <-- add this prop
}: {
  show: boolean;
  onClose: () => void;
  onSaved?: () => void; // <-- add this type
}) {
  const { token } = useAuth();
  const { bookable, dispatch } = useContext(BookableContext);
  const [ message, setMessage ] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: bookable.title || "",
      price: bookable.price || 1,
      desc: bookable.desc || "",
      color: bookable.color || "#000000",
    },
  });

  useEffect(() => {
    form.reset({
      title: bookable.title || "",
      price: bookable.price || 1,
      desc: bookable.desc || "",
      color: bookable.color || "#000000",
    });
  }, [bookable, form, show]);

  const onSubmit = async (values: FormValues) => {
    const bookablesService = new Bookables();
    try {
      if (bookable.uuid != "" && bookable.uuid) {
        await bookablesService.updateBookable(bookable.uuid, values as IBookable, token!);
        setMessage("Bookable updated!");
      } else {
        await bookablesService.createBookable(values as IBookable, token!);
        setMessage("Bookable created!");
      }
      handleSwitchToCreate();
      onClose();
      if (onSaved) onSaved(); // <-- call after successful save
    } catch (err) {
      console.error(err);
      setMessage("Error creating/updating bookable");
    }
  };

  const handleSwitchToCreate = () => {
    dispatch({ type: ActionType.SET_TITLE, payload: "" });
    dispatch({ type: ActionType.SET_PRICE, payload: "1" });
    dispatch({ type: ActionType.SET_DESCRIPTION, payload: "" });
    dispatch({ type: ActionType.SET_COLOR, payload: "#000000" });
    dispatch({ type: ActionType.SET_UUID, payload: "" });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white border-grey rounded-lg shadow-lg w-full max-w-md mx-auto p-2">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={() => {
            handleSwitchToCreate();
            onClose();
          }}
          aria-label="Close"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
        {bookable.uuid && (
          <Button
            variant="outline"
            className="mb-4"
            onClick={handleSwitchToCreate}
          >
            Switch to Create New Bookable
          </Button>
        )}
        <div className="text-gray-500 text-center">{message}</div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border-1 rounded-lg shadow-sm p-10"
        >
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
              <Textarea
                id="description"
                {...form.register("desc")}
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
    </div>
  );
}
