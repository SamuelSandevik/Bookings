"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const weekDays: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DayInfo = {
  date: Date;
  isCurrentMonth: boolean;
};

const BigCalendarMonth = ({ onData }: { onData: (dayInfo: DayInfo) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthDays, setMonthDays] = useState<DayInfo[][]>([]); // weeks -> days

    const sendDataToParent = (data: DayInfo) => {
      onData(data);
    };


  const today = new Date();

  // get month grid (6 rows max × 7 cols)
  const createMonthArray = () => {

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // find first Monday before or on startOfMonth
    const startDay = new Date(startOfMonth);
    const dayOfWeek = (startDay.getDay() + 6) % 7; // convert Sun=0 → 6
    startDay.setDate(startDay.getDate() - dayOfWeek);

    // build 6 weeks (42 days)
    const weeks: DayInfo[][] = [];
    let day = new Date(startDay);

    for (let w = 0; w < 6; w++) {
      const week: DayInfo[] = [];
      for (let d = 0; d < 7; d++) {
        week.push({
          date: new Date(day),
          isCurrentMonth: day.getMonth() === currentDate.getMonth(),
        });
        day.setDate(day.getDate() + 1);
      }
      weeks.push(week);
    }

    setMonthDays(weeks);
  };

  useEffect(() => {
    createMonthArray();
  }, [currentDate]);

  const getMonthName = (date: Date) =>
    date.toLocaleString("en-US", { month: "long", year: "numeric" });

  // navigation
  const handleMonthChange = (direction: "forward" | "back") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "forward" ? 1 : -1));
      return newDate;
    });
  };
  

  if (monthDays.length === 0)
    return <Skeleton className="mt-6 h-[90%] w-full bg-gray-400" />;

  return (
    <div className="flex flex-col gap-0.5 w-full">
      {/* Header with navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-transparent text-black hover:bg-gray-50 shadow-none"
                onClick={() => handleMonthChange("back")}
              >
                <ChevronLeft size={28} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous month</p>
            </TooltipContent>
          </Tooltip>
          <Button onClick={() => setCurrentDate(new Date())}>Current Month</Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-transparent text-black hover:bg-gray-50 shadow-none"
                onClick={() => handleMonthChange("forward")}
              >
                <ChevronRight size={28} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next month</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="text-xl font-semibold">{getMonthName(currentDate)}</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-[5%_6fr] gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Weekday headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-100 flex items-center justify-center font-medium"
          >
            {day}
          </div>
        ))}

        {/* Month days */}
        {monthDays.flat().map((dayInfo, i) => {
          const isToday =
            dayInfo.date.toDateString() === today.toDateString();
          return (
            <div
              key={i}
              className={`h-24 flex items-start justify-start p-1 text-sm hover:bg-gray-50 ${
                dayInfo.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              } ${isToday ? "border-2 border-red-400" : ""}`}
              onClick={() => sendDataToParent(dayInfo)} 
           >
              {dayInfo.date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BigCalendarMonth;
