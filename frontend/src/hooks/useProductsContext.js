import { ProductContext } from "../context/ProductsContext"
import { useContext } from "react"

export const useProductsContext = () => {
    const context = useContext(ProductContext)

    if(!context){
        throw Error("useProductsContext must be used inside an ProductsContextProvider")
    }
    
    return context
}