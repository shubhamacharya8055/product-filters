import { db } from "@/db"
import { ProductFilterValidator } from "@/lib/validators/product-validator";
import { NextRequest } from "next/server"



const AVG_SORT_PRICE = 300;
const MAX_SORT_PRICE = 1000;

class Filter {
    private filters: Map<string, string[]> = new Map();

    hasFilters () {
        return this.filters.size > 0
    }

    add (key: string , operator: string , value: string | number) {
        const currentFilter = this.filters.get(key) || []
        currentFilter.push(`${key} ${operator} ${typeof key === "number" ? value : `"${value}"`}`)
        this.filters.set(key , currentFilter)
    } 
    
    addRaw (key: string , rawFilter: string) {
        this.filters.set(key, [rawFilter])
    }

    // (color = white) or (size = "S")

    get () {
        const parts: string[] = []
        this.filters.forEach((filter) => {
            const groupedValues = filter.join(` OR `)
            parts.push(`(${groupedValues})`)
        })
        return parts.join(' AND ')
    }
}

export const POST = async function(req: NextRequest) {

    try {
        const body = await req.json();

        const {color,price,size,sort} = ProductFilterValidator.parse(body.filter)
    
        const filter = new Filter()


        if(color.length > 0 ) {
        color.forEach((color) => filter.add("color", "=", color))
        }

        else if (color.length === 0) {
            filter.addRaw("color" , `color = ""`)
        }

        if(size.length > 0)  size.forEach((size) => filter.add("size", "=", size))
        else if(size.length === 0) {
            filter.addRaw("size" , `size = ""`)
        }
    
        filter.addRaw('price', `price >= ${price[0]} AND price <= ${price[1]}`)
    
        const products = await db.query({
            topK: 12 , 
            vector: [0,0,sort === 'none' ? AVG_SORT_PRICE :sort === "price-asc" ? 0 : MAX_SORT_PRICE],
            includeMetadata: true,
            filter: filter.hasFilters() ? filter.get() : undefined
        })
    
        return new Response(JSON.stringify(products))
    } catch (error) {
        console.log(error)

        return new Response(JSON.stringify({message: "Internal Server error"}) , {
            status: 500
        })
    }
   
}

