"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Bookables from "@/services/Bookables";
import { IBookable } from "@/models/IBookable";
import { ISlot } from "@/models/ISlot";
import { useAuth } from "@/context/AuthContext";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CreateBookableForm from "@/components/create-bookable-form";
import { BookableContext } from "@/context/BookableContext";
import { ActionType } from "@/reducers/BookableReducer";
import { Pencil, Trash2 } from "lucide-react";

export default function BookableDetailPage() {
  const params = useParams();
  const uuid = params?.bookable as string;
  const [bookable, setBookable] = useState<IBookable | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const { dispatch } = useContext(BookableContext);

  const fetchBookable = async () => {
    setLoading(true);
    try {
      const service = new Bookables();
      const result = await service.getSingleBookable(uuid, token!);
      setBookable(result);
      if (result) {
        dispatch({ type: ActionType.SET_TITLE, payload: result.title });
        dispatch({ type: ActionType.SET_PRICE, payload: String(result.price) });
        dispatch({ type: ActionType.SET_DESCRIPTION, payload: result.desc });
        dispatch({ type: ActionType.SET_COLOR, payload: result.color });
        dispatch({ type: ActionType.SET_UUID, payload: result.uuid || "" });
      }
    } catch (err) {
      setBookable(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) fetchBookable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, token]);

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const service = new Bookables();
        const result = await service.getSlotsForBookable(uuid, token!);
        setSlots(result || []);
      } catch (err) {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    if (uuid) fetchSlots();
  }, [uuid, token]);

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleRemove = async () => {
    if (!bookable) return;
    const service = new Bookables();
    try {
      await service.deleteBookable(bookable, token!);
      router.push("/bookables");
    } catch (err) {
    }
  };

  const handleSaved = async () => {
    await fetchBookable();
    setShowForm(false);
  };

  if (loading) return <Skeleton className="w-full h-64" />;
  if (!bookable)
    return (
      <div className="p-8">
        Bookable not found. <br />
        <Button
          size="sm"
          variant="outline"
          className="text-gray-500 border-gray-300"
          onClick={() => {
            router.push("/bookables");
          }}
        >
          Return to bookables
        </Button>
      </div>
    );

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/panel">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/bookables">Bookables</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/bookables/${bookable.uuid}`}>
              {bookable.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div
        className="flex flex-col md:flex-row border-l-2 gap-8 mt-8 rounded bg-gray-50 h-96"
        style={{ borderColor: bookable.color }}
      >
        {/* Bookable Details */}
        <div className="flex-1 max-w-md p-2 relative">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">
              &nbsp;{bookable.title}
            </h1>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 p-1"
                onClick={handleEdit}
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 p-1"
                onClick={handleRemove}
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mb-2 text-gray-700">{bookable.desc}</div>
          <div className="mb-2 font-semibold">{bookable.price} kr</div>
        </div>
        {/* Slots Table */}
        <div className="flex-1 min-w-[320px]">
          <h2 className="text-xl font-semibold mb-4">Slots</h2>
          {slotsLoading ? (
            <Skeleton className="w-full h-32" />
          ) : slots.length === 0 ? (
            <div className="text-gray-400">No slots placed for this bookable.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Max Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.uuid}>
                    <TableCell>
                      {new Date(slot.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{slot.timeFrom}</TableCell>
                    <TableCell>{slot.timeTo}</TableCell>
                    <TableCell>{slot.maxCapacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      <CreateBookableForm
        show={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}