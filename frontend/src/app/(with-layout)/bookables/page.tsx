"use client"

import BookableCard from "@/components/bookable-card";
import CreateBookableForm from "@/components/create-bookable-form";
import { useAuth } from "@/context/AuthContext";
import { IBookable } from "@/models/IBookable";
import Bookables from "@/services/Bookables";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookablesPage() {
    const { token } = useAuth();
    const router = useRouter();
  
  const [bookablesList, setBookablesList] = useState<IBookable[]>([]);

  useEffect(() => {
    const fetchBookables = async () => {
      try {
        const bookables = new Bookables();
        if (token) {
          const response = await bookables.getBookables(token!);
          if (response) {
            setBookablesList([...bookablesList, ...response]);
          } else {
            console.error("Fetch failed");
          }
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

    fetchBookables();
  }, [token]);
  return (
    <div className="flex justify-evenly sm:flex-row flex-col items-stretch">
      <div className="bg-white p-6">
        <h1 className="text-2xl font-bold mb-4">List of created bookables</h1>
         {bookablesList.map((bookable) => (
        <div key={bookable.uuid} className="mb-2">
          <BookableCard {...bookable}/>
        </div>
        ))}
      </div>

      <div className="w-[1px] rounded-lg bg-gray-300" />

      <div className="bg-white flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Create a Bookable</h1>
        <CreateBookableForm />
      </div>
    </div>
  );
}
