"use client"

import { Table, TableProps, TableBody, TableBodyProps, TableCell, TableCellProps, TableColumn, TableColumnProps, TableHeader, TableHeaderProps, TableRow, TableRowProps } from "@heroui/react"
import React from "react"

export const AovTable = (props: TableProps) => {
    return <Table {...props} />
}

export const AovTableBody = <T,>(props: TableBodyProps<T>) => {
    return <TableBody {...props} />
}

export const AovTableCell = (props: TableCellProps) => {
    return <TableCell {...props} />
}

export const AovTableColumn = <T,>(props: TableColumnProps<T>) => {
    return <TableColumn {...props} />
}

export const AovTableHeader = <T,>(props: TableHeaderProps<T>) => {
    return <TableHeader {...props} />
}

export const AovTableRow = (props: TableRowProps) => {
    return <TableRow {...props} />
}
