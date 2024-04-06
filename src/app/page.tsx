"use client"

import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Product as TProduct } from "@/db";
import { cn } from "@/lib/utils";
import { ProductState } from "@/lib/validators/product-validator";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import { ChevronDown, Filter } from "lucide-react";
import { useCallback, useState } from "react";
import debounce from 'lodash.debounce'
import EmptyState from "@/components/Products/EmptyState";


const SORT_OPTIONS = [
  {
    name: "None",
    value: "none"
  },
  {
    name: "Price: Low to High",
    value: "price-asc"
  },
  {
    name: "Price: High to Low",
    value: "price-desc"
  }
] as const

const SUB_CATEGORIES = [
  {name: "T-Shirts" , selected: true , href: "#"}, 
  // {name: "Hoodies" , selected: false , href: "#"}, 
  // {name: "SweatShirts" , selected: false , href: "#"}, 
  // {name: "Accessories" , selected: false , href: "#"}, 
] 

const COLOR_FILTERS = {
  id: "color" , 
  name: "Color" , 
  options: [
    {value: "white" , label: "White"},
    {value: "beige" , label: "Beige"},
    {value: "blue" , label: "Blue"},
    {value: "green" , label: "Green"},
    {value: "purple" , label: "Purple"}
  ]
} as const

const SIZE_FILTERS = {
  id: "size" , 
  name: "Size" , 
  options: [
    {value: "S" , label: "S"},
    {value: "M" , label: "M"},
    {value: "L" , label: "L"},
  ]
} as const

const PRICE_FILTERS = {
  id: "price" , 
  name: "Price",
  options: [{
    value: [0 , 1000] , 
    label: "Any Price"
  }, 
  {
    value: [0, 200],
    label: "Under 300 ₹"
  },
  {
    value: [0, 500],
    label: "Under 500 ₹"
  }

  // custom options defined in jsx

]
} as const


const DEFAULT_CUSTOM_PRICE = [0, 1000] as [number , number]


export default function Home() {

  const [filter, setFilter] = useState<ProductState>({
    sort: "none",
    color: ["white" , "beige" , "green", "blue", "purple"],
    price: {custom: false , range: DEFAULT_CUSTOM_PRICE},
    size: ["L" , "M" , "S"]
  })

  const {data:products ,refetch} = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
        const {data } = await axios.post<QueryResult<TProduct>[]>(
          "https://thecottonco.vercel.app/api/products" , 
          {
            filter: {
              sort: filter.sort , 
              color: filter.color,
              price: filter.price.range,
              size: filter.size,
            }
          }
        )
        return data
    }
  });

  const onSubmit = () => {
    refetch()
  }

  const debouncedSubmit = debounce(onSubmit , 400) 
  const _debouncedSubmit = useCallback(debouncedSubmit , [debouncedSubmit])

  const applyArrayFilter = ({category, value}: {category: keyof Omit<typeof filter, "price" | "sort">,value: string}) => {
      const isFilterApplied = filter[category].includes(value as never)
      if(isFilterApplied) {
        setFilter((prev) => ({
          ...prev ,
          [category] : prev[category].filter(v => v!== value)
        }))
      } else {
        setFilter((prev) => ({
          ...prev , 
          [category]: [...prev[category], value]
        }))
      }

      _debouncedSubmit()
  }

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1])
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-8s">
      <div
      className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24"
      >

        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          High-quality cotton selection
        </h1>

        <div className="flex items-center z-50 ">
            <DropdownMenu >
              <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                Sort
                <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"/>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="bg-white rounded-md">
                  {SORT_OPTIONS.map(option => (
                    <button key={option.name}
                    className={cn('w-full text-left block px-4 py-2 text-sm' , {
                      "text-gray-950" : option.value === filter.sort , 
                      "text-gray-500": option.value !== filter.sort ,
                      "bg-gray-200" : option.value == filter.sort
                    })}
                    onClick={() => {
                      setFilter((prev) => {
                        return {
                          ...prev , 
                          sort: option.value
                        }
                      })

                      _debouncedSubmit()
                    } 
                  }
                    >{option.name}</button>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            
            <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
              <Filter className="h-5 w-5" />
            </button>

        </div>

      </div>

      
      <section className="pb-24 pt-6 ">
            
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 ">

                  {/* Filters */}

                  {/* Sub Categories */}
                  <div className=" lg:block">
                    <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
                      {SUB_CATEGORIES.map((category) => (
                        <li key={category.name}>
                          <button disabled= {!category.selected} className="disabled:cursor-not-allowed disabled:opacity-60">
                            {category.name}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* accordian */}
                    <Accordion type="multiple" className="animate-none">

                        {/* color filter */}

                        <AccordionItem value="color">
                          <AccordionTrigger className="hover:text-gray-500 py-3 text-sm text-gray-400">
                            <span className="font-medium text-gray-900">Color</span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-6 animate-none">
                            <ul className="space-y-4">
                          {COLOR_FILTERS.options.map((option, optionIdx) => (
                            <li key={option.value} className="flex items-center">
                              <input type="checkbox" id={`color-${optionIdx}`} 
                              className="h-4 w-4  rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              onChange={() => {
                                applyArrayFilter({
                                  category: "color" ,
                                  value: option.value
                                })
                              }}
                              checked={filter?.color?.includes(option.value)}
                              />
                              <label htmlFor={`color-${optionIdx}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                            </li>
                          ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                          {/* Size Filters  */}
                        <AccordionItem value="size">
                          <AccordionTrigger className="hover:text-gray-500 py-3 text-sm text-gray-400">
                            <span className="font-medium text-gray-900">Size</span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-6 animate-none">
                            <ul className="space-y-4">
                          {SIZE_FILTERS.options.map((option, optionIdx) => (
                            <li key={option.value} className="flex items-center">
                              <input type="checkbox" id={`size-${optionIdx}`} 
                              className="h-4 w-4  rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              onChange={() => {
                                applyArrayFilter({
                                  category: "size" ,
                                  value: option.value
                                })
                              }}
                              checked={filter?.size?.includes(option.value)}
                              />
                              <label htmlFor={`size-${optionIdx}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                            </li>
                          ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Price filters */}
                        <AccordionItem value="price">
                          <AccordionTrigger className="hover:text-gray-500 py-3 text-sm text-gray-400">
                            <span className="font-medium text-gray-900">Price</span>
                          </AccordionTrigger>
                          <AccordionContent className="pt-6 animate-none">
                            <ul className="space-y-4">
                          {PRICE_FILTERS.options.map((option, optionIdx) => (
                            <li key={option.label} className="flex items-center">
                              <input type="radio" id={`price-${optionIdx}`} 
                              className="h-4 w-4  rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              onChange={() => {
                                setFilter((prev) => ({
                                  ...prev , 
                                  price: {
                                    custom: false , 
                                    range: [...option.value]
                                  }
                                }))

                                _debouncedSubmit()
                              }}
                              checked={!filter.price.custom && filter.price.range[0] === option.value[0]
                              && filter.price.range[1] === option.value[1]
                              }
                              />
                              <label htmlFor={`price-${optionIdx}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                            </li>
                          ))}
                          <li className="flex justify-center flex-col gap-2">
                                <div>
                                <input type="radio" id={`price-${PRICE_FILTERS.options.length}`} 
                              className="h-4 w-4  rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              onChange={() => {
                                setFilter((prev) => ({
                                  ...prev , 
                                  price: {
                                    custom: true , 
                                    range: [0,1000]
                                  }
                                }))

                                _debouncedSubmit()
                              }}
                              checked={filter.price.custom}
                              />
                              <label htmlFor={`price-${PRICE_FILTERS.options.length}`} className="ml-3 text-sm text-gray-600">Custom</label>
                                </div>

                                <div className="flex justify-between">
                                  <p className="font-medium">Price</p>
                                  <div>
                                    {filter.price.custom ? minPrice.toFixed(0) : filter.price.range[0].toFixed(0)} ₹ - {" "}
                                    {filter.price.custom ? maxPrice.toFixed(0) : filter.price.range[1].toFixed(0)} ₹
                                  </div>
                                </div>

                                <Slider 
                                className={cn({"opacity-50": !filter.price.custom})}
                                disabled = {!filter.price.custom}
                                onValueChange={(range)=> {
                                  const [newMin , newMax] = range;
                                  setFilter((prev) => ({
                                    ...prev , 
                                    price: {
                                      custom: true , 
                                      range: [newMin , newMax]
                                    }
                                  }))

                                  _debouncedSubmit()
                                }}
                                value={filter.price.custom ? filter.price.range : DEFAULT_CUSTOM_PRICE}
                                min={DEFAULT_CUSTOM_PRICE[0]}
                                max={DEFAULT_CUSTOM_PRICE[1]}
                                step={5}
                                defaultValue={DEFAULT_CUSTOM_PRICE}
                                
                                />
                          </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                    </Accordion>

                  </div>

                  {/* Product grid */}

                  <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8  ">
                    {products && products.length === 0 ? <EmptyState /> : products ? products?.map((product , productId) => (
                      <Product product = {product.metadata!} key={productId} />
                    )) : Array.from({length: 12} , (_ , i) => (
                      <ProductSkeleton key={i + 1}/>
                    ))}
                  </ul>

            </div>

      </section>

    </main>
  )
}
