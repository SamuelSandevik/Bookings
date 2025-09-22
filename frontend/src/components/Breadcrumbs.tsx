"use client";

import { usePathname, useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { useEffect, useState } from "react";
import Bookables from "@/services/Bookables";
import { useAuth } from "@/context/AuthContext";

async function getBookableTitle(uuid: string, token: string): Promise<string> {
  const bookable = await new Bookables().getSingleBookable(uuid, token);
  return `${bookable!.title}`;
}


export function Breadcrumbs() {
  const pathname = usePathname();
  const params = useParams();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const { token } = useAuth()

  const segments = pathname.split("/").filter(Boolean);

  useEffect(() => {
  const fetchLabels = async () => {
    const newLabels: Record<string, string> = {};

    if (params.bookableUuid) {
      newLabels[params.bookableUuid as string] = await getBookableTitle(
        params.bookableUuid as string,
        token!
      );
    }

    setLabels(newLabels);
  };

  fetchLabels();
}, [params]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/panel">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");

          // If this segment is one of our params, replace with fetched label
          const label = labels[segment] ?? segment;

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={href} className="first-letter:capitalize">{label}</BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
