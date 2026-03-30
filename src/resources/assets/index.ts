
// we represent as a function to ensure optional loading or logic processing
export const assetConfig = () => {
    const icon = () => {
        const iconsPath = "/icons"
        const payment = () => {
            const paymentPath = `${iconsPath}/payment`
            return {
                payos: `${paymentPath}/payos.svg`,
                sepay: `${paymentPath}/sepay.svg`,
            }
        }
        return {
            payment,
        }
    }
    return {
        icon,
    }
}