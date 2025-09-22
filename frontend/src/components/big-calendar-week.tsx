"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
    ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const weekDays: string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type WeekDayInfo = {
  day: string;
  date: string;
};

const BigCalendarWeek = ({ dateChosen }: { dateChosen: number }) => {
  const [currentDay, setCurrentDay] = useState<number>(dateChosen);
  const [week, setWeek] = useState<WeekDayInfo[]>([]);
  const todayDate = new Date().toLocaleDateString();

  // builds the week array based on currentDay
  const createWeekArray = () => {
    const today = new Date(currentDay);

    // get index where Monday=0, Sunday=6
    let dayIndex = today.getDay();
    dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayIndex);

    const weekWithDates: WeekDayInfo[] = weekDays.map((day, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return { day, date: date.toLocaleDateString() };
    });

    setWeek(weekWithDates);
  };

    const getMonthName = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleString("en-US", { month: "long" });
    };



  useEffect(() => {
    createWeekArray();
  }, [currentDay]);

  // step forward/back one full week
  const handleWeekChange = (direction: "forward" | "back") => {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    setCurrentDay((prev) =>
      direction === "forward" ? prev + oneWeek : prev - oneWeek
    );
  };

  // step forward/back one single day
  const handleDayChange = (direction: "forward" | "back") => {
    const oneDay = 24 * 60 * 60 * 1000;
    setCurrentDay((prev) =>
      direction === "forward" ? prev + oneDay : prev - oneDay
    );
  };

  const contents = Array(7).fill("content");

  if (week.length === 0)
    return <Skeleton className="mt-6 h-[90%] w-full bg-gray-400" />;

  // derive the current day index within the week
  const currentDate = new Date(currentDay).toLocaleDateString();
  const currentIndex = week.findIndex((d) => d.date === currentDate);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-0.5 w-full">
        {/* backward buttons */}
      <div className="flex flex-row sm:justify-start justify-center gap-2">
        <div className="flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-transparent text-black hover:bg-gray-50 shadow-none"
                onClick={() => handleWeekChange("back")}
              >
                <ChevronsLeft size={30} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous week</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-transparent sm:hidden block text-black hover:bg-gray-50 shadow-none"
                onClick={() => handleDayChange("back")}
              >
                <ChevronLeft size={30} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous day</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* today button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="" onClick={() => setCurrentDay(Date.now())}>Today</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{todayDate}</p>
          </TooltipContent>
        </Tooltip>

        {/* forward buttons */}
        <div className="flex flex-wrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-transparent sm:hidden block text-black hover:bg-gray-50 shadow-none"
                onClick={() => handleDayChange("forward")}
              >
                <ChevronRight size={30} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next day</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-transparent text-black hover:bg-gray-50 shadow-none"
                onClick={() => handleWeekChange("forward")}
              >
                <ChevronsRight size={30} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next week</p>
            </TooltipContent>
          </Tooltip>
        </div>
        </div>
            <div className="flex items-center sm:justify-end justify-center text-xl font-semibold">
              {getMonthName(week[0].date) === getMonthName(week[6].date)
              ? getMonthName(week[0].date)
              : (
                  <>
                    {getMonthName(week[0].date)} <ArrowRight className="inline w-4 h-4 mx-1" /> {getMonthName(week[6].date)}
                  </>
                )
              }
            </div>
      </div>

      <div className="h-[88%] rounded-lg w-full bg-gray-50 p-1 flex justify-center">
        <div className="h-full w-full grid grid-cols-1 sm:grid-cols-7 grid-rows-[10%_90%] bg-gray-50">
          {/* Mobile header */}
          {currentIndex >= 0 && (
            <div
              className={`sm:hidden h-full flex flex-col items-center justify-center font-medium bg-gray-50 rounded-t-md ${
                week[currentIndex].date === todayDate
                  ? "border border-b-0 border-red-400"
                  : ""
              }`}
            >
              <div className={`${week[currentIndex].day === "Sunday" ? "text-red-400" : ""}`}>{week[currentIndex].day}</div>
              <div>{week[currentIndex].date}</div>
            </div>
          )}

          {/* Desktop headers */}
          {week.map((item, i) => (
            <div
              key={`header-${i}`}
              className={`hidden sm:flex h-full sm:flex-col items-center justify-center font-medium odd:bg-gray-100 rounded-t-md ${
                item.date === todayDate ? "border border-b-0 border-red-400" : ""
              }`}
            >
              <div className={`${item.day === "Sunday" ? "text-red-400" : ""}`}>
                {item.day}
              </div>
              <div>{item.date}</div>
            </div>
          ))}

          {/* Mobile content */}
          <div
            className={`sm:hidden w-full h-full bg-gray-100 rounded-b-lg flex items-center justify-center ${
              currentIndex >= 0 && week[currentIndex].date === todayDate
                ? "border border-t-0 border-red-400"
                : ""
            }`}
          >
            Content
          </div>

          {/* Desktop content */}
          {contents.map((item, i) => (
            <div
              key={`content-${i}`}
              className={`hidden sm:flex w-full h-full items-center rounded-b-md justify-center odd:bg-gray-100 ${
                week[i].date === todayDate ? "border-red-400 border-t-0 border" : ""
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BigCalendarWeek;
