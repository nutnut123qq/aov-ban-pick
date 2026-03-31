"use client";

import React from "react";
import { Button, type ButtonProps } from "@heroui/react";

export type TedoButtonProps = ButtonProps;

/** TEDO-styled primary button wrapper. */
export const TedoButton = (props: TedoButtonProps) => {
  return (
    <Button
      className="px-4 py-2 font-medium rounded-full"
      {...props}
    />
  );
};

