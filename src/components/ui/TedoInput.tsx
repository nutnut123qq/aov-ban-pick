"use client";

import React from "react";
import { Input, type InputProps } from "@heroui/react";

export type TedoInputProps = InputProps;

/** TEDO-styled text input wrapper. */
export const TedoInput = (props: TedoInputProps) => {
  return (
    <Input
      radius="full"
      classNames={{
        inputWrapper: "border border-default-200 data-[focus=true]:border-primary",
      }}
      {...props}
    />
  );
};

