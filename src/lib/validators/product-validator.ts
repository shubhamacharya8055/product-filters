import {z} from 'zod';

export const AVAILABLE_SIZES = ["S" , "M" , "L"]  as const
export const AVAILABLE_COLORS = ["white" , "beige" , "green", "blue", "purple"]  as const
export const AVAILABLE_SORT = ["none", "price-asc", "price-desc"]  as const

// z.enum -> takes the available sort . i.e the value inside the available sort array is taken as only any one 
// ex-> it could be taken as none or price-asc or price-desc 

// but for the rest of the size and colors , the zod has pre defined as array , and it takes multiple values 

// Defineing the schema helps to enforce shape on backend and full type safety on frontend

export const ProductFilterValidator = z.object({
    size: z.array(z.enum(AVAILABLE_SIZES)),
    color: z.array(z.enum(AVAILABLE_COLORS)),
    sort: z.enum(AVAILABLE_SORT),
    price: z.tuple([z.number(), z.number()])
})


// omit helps to remove any one of the property and also allows us to redefine the property with same type safety 
// that we have defined at the initial declaration of zod 
export type ProductState = Omit<z.infer<typeof ProductFilterValidator>, "price"> & {
    price: {
        custom: boolean,
        range: [number, number]
    }
}