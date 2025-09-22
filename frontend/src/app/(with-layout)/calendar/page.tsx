'use client'

import BigCalendarMonth from '@/components/big-calendar-month'
import BigCalendarWeek from '@/components/big-calendar-week'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { IBookable } from '@/models/IBookable'
import { ISlot } from '@/models/ISlot'
import Bookables from '@/services/Bookables'
import Slots from '@/services/Slots'
import React, { useEffect, useState } from 'react'

type DayInfo = {
  date: Date;
  isCurrentMonth: boolean;
};

const CalendarPage = () => {
  const { token } = useAuth();
  const [calendarTypeMonth, setCalendarTypeMonth] = useState(true);
  const [dataFromChild, setDataFromChild] = useState<number | null>(null);

const fetchSlots = async () => {
  try {
    if (token) {
      const bookables = await new Bookables().getBookables(token!);
      const slots = new Slots();
      if (bookables !== null) {
        await Promise.all(bookables.map(async (bookable: IBookable) => {
          const placedSlots = await slots.getSlots(bookable.uuid, token!);
          console.log(placedSlots)
        }));
      }
    }
    } catch (error) {
    console.error("Failed to fetch bookables or slots", error);
  }
};
   useEffect(() => {

  fetchSlots();
}, [token]);
  const handleDataFromChild = (childData: DayInfo) => {
    const converted = new Date(childData.date).getTime()
    setDataFromChild(converted);
    setCalendarTypeMonth(false);
    setTimeout(() => {
      setDataFromChild(null);
    }, 1000);
  };
  return (
    <>
      <Button className="sticky top-11/12 left-11/12" onClick={() => {
        setCalendarTypeMonth(!calendarTypeMonth)
        }}>{calendarTypeMonth ? "Week" : "Month"}</Button>
      {/* {Calendar} */}
      {calendarTypeMonth ? <BigCalendarMonth onData={handleDataFromChild}></BigCalendarMonth> 
      : <BigCalendarWeek dateChosen={dataFromChild === null ? Date.now() : dataFromChild}></BigCalendarWeek>}
      
    </>
  )
}

export default CalendarPage