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
import { Pencil, Trash2, Plus } from "lucide-react";
import CreateSlotForm from "@/components/create-slot-form";
import { SlotContext } from "@/context/SlotContext";
import { ActionType as SlotActionType } from "@/reducers/SlotReducer";
import Slots from "@/services/Slots";
import TimestampConverter from "@/services/TimestampConverter";

export default function BookableDetailPage() {
  const {bookableUuid} = useParams<{bookableUuid: string}>();
  const [bookable, setBookable] = useState<IBookable | null>(null);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const { dispatch } = useContext(BookableContext);
  const { dispatch: slotDispatch } = useContext(SlotContext);

  const fetchBookable = async () => {
    setLoading(true);
    if (token){

      try {
        const service = new Bookables();
        const result = await service.getSingleBookable(bookableUuid, token!);
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
    }
  };

  const fetchSlots = async () => {
    setSlotsLoading(true);
    if(token){
      try {
        const service = new Slots();
        const result = await service.getSlots(bookableUuid, token!);
        setSlots(result || []);
      } catch (err) {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (bookableUuid) fetchBookable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookableUuid, token]);

  useEffect(() => {
    if (bookableUuid) fetchSlots();
  }, [bookableUuid, token]);

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

  // Slot form handlers
  const handleSlotSaved = async () => {
    await fetchSlots();
    setShowSlotForm(false);
  };

  const handleCreateSlot = () => {
    // Reset slot context to initial state for new slot, but set bookable
    slotDispatch({ type: SlotActionType.SET_DATE, payload: 0 });
    slotDispatch({ type: SlotActionType.SET_TIME_FROM, payload: 0 });
    slotDispatch({ type: SlotActionType.SET_TIME_TO, payload: 0 });
    slotDispatch({ type: SlotActionType.SET_MAX_CAPACITY, payload: 1 });
    slotDispatch({ type: SlotActionType.SET_BOOKABLE, payload: bookable });
    slotDispatch({ type: SlotActionType.SET_UUID, payload: "" });
    setShowSlotForm(true);
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
        className="flex flex-col md:flex-row border-l-2 gap-8 mt-8 rounded bg-gray-50 min-h-96"
        style={{ borderColor: bookable.color }}
      >
        {/* Bookable Details */}
        <div className="flex-1 max-w-xs p-2 relative">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Slots</h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleCreateSlot}
              title="Add Slot"
            >
              <Plus className="w-4 h-4" /> Add Slot
            </Button>
          </div>
          {slotsLoading ? (
            <Skeleton className="w-full h-32" />
          ) : slots.length === 0 ? (
            <div className="text-gray-400">
              No slots placed for this bookable.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Min Capacity</TableHead>
                  <TableHead>Max Capacity</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.uuid}>
                    <TableCell>
                      {new Date(slot.date).getDate() + "-" + (new Date(slot.date).getMonth() + 1) + "-" + new Date(slot.date).getFullYear()}
                    </TableCell>
                    <TableCell>{TimestampConverter.msToHMS(slot.time_from)}</TableCell>
                    <TableCell>{TimestampConverter.msToHMS(slot.time_to)}</TableCell>
                    <TableCell>{slot.min_capacity ? slot.min_capacity : "No minimum"}</TableCell>
                    <TableCell>{slot.max_capacity}</TableCell>
                    <TableCell><Button onClick={async () => {
                      await new Slots().deleteSlot(slot.uuid, token!);
                      fetchSlots();
                      }}>Delete</Button></TableCell>
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
      <CreateSlotForm
        show={showSlotForm}
        onClose={() => setShowSlotForm(false)}
        onSaved={handleSlotSaved}
        bookable={bookable}
      />
    </div>
  );
}