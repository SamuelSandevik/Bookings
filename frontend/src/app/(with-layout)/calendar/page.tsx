import BigCalendarWeek from '@/components/big-calendar-week'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import React from 'react'

const CalendarPage = () => {
  return (
    <>
    <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/panel">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/calendar">Calendar</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* {Calendar} */}
      <BigCalendarWeek></BigCalendarWeek>
    </>
  )
}

export default CalendarPage