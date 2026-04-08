"use client"

import { Table, TableProps, TableBody, TableBodyProps, TableCell, TableCellProps, TableColumn, TableColumnProps, TableHeader, TableHeaderProps, TableRow, TableRowProps } from "@heroui/react"
import React from "react"

export const TedoTable = (props: TableProps) => {
    return <Table {...props} />
}

export const TedoTableBody = <T,>(props: TableBodyProps<T>) => {
    return <TableBody {...props} />
}

export const TedoTableCell = (props: TableCellProps) => {
    return <TableCell {...props} />
}

export const TedoTableColumn = (props: TableColumnProps) => {
    return <TableColumn {...props} />
}

export const TedoTableHeader = (props: TableHeaderProps) => {
    return <TableHeader {...props} />
}

export const TedoTableRow = (props: TableRowProps) => {
    return <TableRow {...props} />
}
