"use client";

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SlotContext } from "@/context/SlotContext";
import { ActionType } from "@/reducers/SlotReducer";
import Slots from "@/services/Slots";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ISlot } from "@/models/ISlot";
import { IBookable } from "@/models/IBookable";
import { useAuth } from "@/context/AuthContext";
import { ChevronDownIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import TimestampConverter from "@/services/TimestampConverter";

// Form schema
const formSchema = z.object({
  date: z.coerce.number(),
  timeFrom: z.coerce.number(),
  timeTo: z.coerce.number(),
  maxCapacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  minCapacity: z.coerce.number().min(1, { message: "Capacity must be at least 0." }),
  bookableUuid: z.string().min(1, { message: "Bookable is required." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSlotForm({
  show,
  onClose,
  onSaved,
  bookable,
}: {
  show: boolean;
  onClose: () => void;
  onSaved?: () => void;
  bookable: IBookable;
}) {
  const { token } = useAuth();
  const { slot, dispatch } = useContext(SlotContext);
  const [open, setOpen] = useState(false);

  // Local state for date and times
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeFrom, setTimeFrom] = useState("10:30:00");
  const [timeTo, setTimeTo] = useState("11:30:00");
  const [displayDate, setDisplayDate] = useState<Date>(new Date());


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: slot.date || 0,
      timeFrom: slot.timeFrom || 0,
      timeTo: slot.timeTo || 0,
      maxCapacity: slot.maxCapacity || 1,
      minCapacity: slot.minCapacity || 1,
      bookableUuid: slot.bookable?.uuid || bookable.uuid,
    },
  });

    useEffect(() => {
      form.reset({
        date: slot.date || 0,
        timeFrom: slot.timeFrom || 0,
        timeTo: slot.timeTo || 0,
        maxCapacity: slot.maxCapacity || 1,
        minCapacity: slot.minCapacity || 1,
        bookableUuid: slot.bookable?.uuid || bookable.uuid,
      });

      if (slot.date) {
        setDate(new Date(slot.date));
      }

      // Handle timeFrom
      if (slot.timeFrom) {
        setTimeFrom(TimestampConverter.msToHMS(slot.timeFrom));
      } else {
        const ms = TimestampConverter.HMSToms("10:30:00");
        setTimeFrom("10:30:00");
        form.setValue("timeFrom", ms, { shouldDirty: true, shouldValidate: true });
        dispatch({ type: ActionType.SET_TIME_FROM, payload: ms });
      }

      // Handle timeTo
      if (slot.timeTo) {
        setTimeTo(TimestampConverter.msToHMS(slot.timeTo));
      } else {
        const ms = TimestampConverter.HMSToms("11:30:00");
        setTimeTo("11:30:00");
        form.setValue("timeTo", ms, { shouldDirty: true, shouldValidate: true });
        dispatch({ type: ActionType.SET_TIME_TO, payload: ms });
      }

    }, [slot, show, bookable]);

  const handleTimeFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeFrom(value);
    const ms = TimestampConverter.HMSToms(value);
    dispatch({ type: ActionType.SET_TIME_FROM, payload: ms });
    form.setValue("timeFrom", ms);
  };

  const handleTimeToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeTo(value);
    const ms = TimestampConverter.HMSToms(value);
    dispatch({ type: ActionType.SET_TIME_TO, payload: ms });
    form.setValue("timeTo", ms);
  };

  const onSubmit = async (values: FormValues) => {
    const slotsService = new Slots();
    try {
      const slotData: ISlot = {
        ...slot,
        ...values,
        bookable,
      };

      if (slot.uuid) {
        await slotsService.updateSlot(slot.uuid, slotData, token!);
      } else {
        await slotsService.createSlot(slotData, token!);
      }

      handleSwitchToCreate();
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchToCreate = () => {
    dispatch({ type: ActionType.SET_DATE, payload: 0 });
    dispatch({ type: ActionType.SET_TIME_FROM, payload: 0 });
    dispatch({ type: ActionType.SET_TIME_TO, payload: 0 });
    dispatch({ type: ActionType.SET_MAX_CAPACITY, payload: 1 });
    dispatch({ type: ActionType.SET_BOOKABLE, payload: {} as IBookable });
    dispatch({ type: ActionType.SET_UUID, payload: "" });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-2">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={() => {
            handleSwitchToCreate();
            onClose();
          }}
          aria-label="Close"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {slot.uuid && (
          <Button variant="outline" className="mb-4" onClick={handleSwitchToCreate}>
            Switch to Create New Slot
          </Button>
        )}


        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div>
              <h2>Create a slot for <span className="font-bold">{bookable.title}</span></h2>
              <select
                
                id="bookableUuid"
                {...form.register("bookableUuid")}
                required
                className="w-full border rounded p-2 hidden"
                disabled
              >
                <option value={bookable.uuid}>{bookable.title}</option>
              </select>
            </div>
          <div className="grid gap-4">
            {/* Date Picker */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="date-picker">Date</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-32 justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString("sv-SE") : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={displayDate}
                    defaultMonth={date}
                    required
                    onSelect={(selected) => {
                      if (selected) {
                        setDisplayDate(selected)
                        setDate(selected);

                        const ms: number = selected.getTime()
                        dispatch({ type: ActionType.SET_DATE, payload: ms });
                        form.setValue("date", ms);
                      }
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time inputs */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="time-from">From</Label>
                <Input
                  type="time"
                  id="time-from"
                  step="1"
                  value={timeFrom}
                  onChange={handleTimeFromChange}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="time-to">To</Label>
                <Input
                  type="time"
                  id="time-to"
                  step="1"
                  value={timeTo}
                  onChange={handleTimeToChange}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                  required
                />
              </div>
            </div>

            {/* Capacity */}
            <div className="flex justify-evenly">
              <div>
                <Label htmlFor="minCapacity">Min Capacity</Label>
                <Input
                  id="minCapacity"
                  type="number"
                  {...form.register("minCapacity")}
                  min={1}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  {...form.register("maxCapacity")}
                  min={1}
                  required
                  />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {slot.uuid ? "Update Slot" : "Create Slot"}
          </Button>
        </form>
      </div>
    </div>
  );
}
