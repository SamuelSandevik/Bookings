"use client"

import BookableCard from "@/components/bookable-card";
import CreateBookableForm from "@/components/create-bookable-form";
import PlaceholderBookableCard from "@/components/placeholder-bookable-card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/panel">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/bookables">Bookables</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    <div className="">
      <h1 className="text-2xl font-bold my-4">Bookables</h1>
      <div className="bg-gray-100 rounded p-4 flex flex-row gap-2">todo Filters
        <Input className="w-1/5"></Input><select><option></option></select><Button></Button>
      </div>
      <div className="bg-white">
        <div className="w-full overflow-x-hidden">
          {loading ? (
            <div className="grid gap-4 mx-auto p-4 justify-items-center max-w-6xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="min-w-[220px] max-w-[320px] h-32 rounded-xl w-full"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 mx-auto p-4 justify-items-center max-w-6xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
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
