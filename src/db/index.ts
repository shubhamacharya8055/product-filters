import { Index } from "@upstash/vector";
import * as dotenv from 'dotenv'


export type Product = {
    id: string , 
    imageId: string , 
    name : string , 
    size: "S" | "M" | "L",
    color: "white" | "beige" | "blue" | "green" | "purple" , 
    price: number
}

dotenv.config();
export const db = new Index()