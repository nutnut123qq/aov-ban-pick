import { addToast } from "@heroui/toast"

/** Show a danger toast (Vietnamese default title). */
export const toastError = (description: string, title = "Lỗi") =>
    addToast({ title, description, color: "danger" })

/** Show a success toast. */
export const toastSuccess = (description: string, title = "Thành công") =>
    addToast({ title, description, color: "success" })

/** Show a neutral info toast. */
export const toastInfo = (description: string, title = "Thông báo") =>
    addToast({ title, description, color: "primary" })
