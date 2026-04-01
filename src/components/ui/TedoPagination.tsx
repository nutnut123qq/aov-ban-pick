"use client";

import React from "react";
import { Pagination, type PaginationProps } from "@heroui/react";

export type TedoPaginationProps = PaginationProps;

/** TEDO-styled wrapper around HeroUI Pagination. */
export const TedoPagination = (props: TedoPaginationProps) => {
  return <Pagination {...props} />;
};

