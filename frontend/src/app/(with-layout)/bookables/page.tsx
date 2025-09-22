"use client"

import BookableCard from "@/components/bookable-card";
import CreateBookableForm from "@/components/create-bookable-form";
import PlaceholderBookableCard from "@/components/placeholder-bookable-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { IBookable } from "@/models/IBookable";
import Bookables from "@/services/Bookables";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function BookablesPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [bookablesList, setBookablesList] = useState<IBookable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookables = async () => {
      setLoading(true);
      try {
        const bookables = new Bookables();
        if (token) {
          const response = await bookables.getBookables(token!);
          if (response) {
            setBookablesList(response);
          } else {
            console.error("Fetch failed");
          }
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookables();
  }, [token]);

  const handleEdit = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleSaved = useCallback(() => {
    // re-fetch bookables after create/update
    const fetchBookables = async () => {
      setLoading(true);
      try {
        const bookables = new Bookables();
        if (token) {
          const response = await bookables.getBookables(token!);
          if (response) {
            setBookablesList(response);
          }
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookables();
  }, [token]);

  return (
    <>
    <div className="">
      <h1 className="text-2xl font-bold my-4">Bookables</h1>
      <div className="bg-gray-100 rounded p-4 flex flex-col sm:flex-row sm:gap-2 gap-4 flex-wrap">
        {/* Responsive filter controls */}
        <Input className="w-full sm:w-1/5" />
        <select className="w-full sm:w-auto border rounded px-2 py-1">
          <option></option>
        </select>
        <Button className="w-full sm:w-auto">Filter</Button>
      </div>
      <div className="bg-white">
        <div className="w-full overflow-x-hidden">
          {loading ? (
            <div className="grid gap-4 mx-auto p-4 justify-items-center max-w-6xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="min-w-[220px] max-w-[320px] h-40 rounded-xl w-full"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 mx-auto p-4 justify-items-center max-w-6xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {bookablesList.map((bookable) => (
                <BookableCard
                  key={bookable.uuid}
                  {...bookable}
                  onEdit={handleEdit}
                  onRemoved={handleSaved}
                />
              ))}
              <PlaceholderBookableCard onCreate={() => setShowForm(true)} />
            </div>
          )}
        </div>
      </div>
      <CreateBookableForm
        show={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleSaved}
      />
    </div>
    </>
  );
}
