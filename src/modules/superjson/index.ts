import SuperJSON from "superjson"
import Decimal from "decimal.js"
import dayjs, { Dayjs } from "dayjs"

export const superjson = new SuperJSON()

superjson.registerCustom<Decimal, string>(
    {
        isApplicable: (v): v is Decimal => {
            return Decimal.isDecimal(v)
        },
        serialize: (v) => v.toString(),
        deserialize: (v) => new Decimal(v),
    },
    "decimal.js" // identifier
)

superjson.registerCustom<Dayjs, string>(
    {
        isApplicable: (v): v is Dayjs => {
            return dayjs.isDayjs(v)
        },
        serialize: (v) => v.toISOString(),
        deserialize: (v) => dayjs(v),
    },
    "dayjs" // identifier
)