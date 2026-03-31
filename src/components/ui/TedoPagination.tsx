"use client";

import React from "react";
import { Pagination, type PaginationProps } from "@heroui/react";

export type TedoPaginationProps = PaginationProps;

/** TEDO-styled wrapper around HeroUI Pagination. */
export const TedoPagination = (props: TedoPaginationProps) => {
  return (
    <Pagination
      showControls
      size="md"
      classNames={{
        base: "flex items-center justify-center gap-3 py-4",
        item: "min-w-8 min-h-8 rounded-full text-sm",
        prev: "min-w-8 min-h-8 rounded-full text-sm",
        next: "min-w-8 min-h-8 rounded-full text-sm",
      }}
      {...props}
    />
  );
};

