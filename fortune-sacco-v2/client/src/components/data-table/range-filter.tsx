import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface DataTableRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  min?: number
  max?: number
  step?: number
}

export function DataTableRangeFilter<TData, TValue>({
  column,
  title,
  min = 0,
  max = 1000000,
  step = 100,
}: DataTableRangeFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue() as [number, number] | undefined
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([
    filterValue?.[0] ?? min,
    filterValue?.[1] ?? max,
  ])

  // Sync state when filterValue changes externally
  React.useEffect(() => {
    setSliderValue([
      filterValue?.[0] ?? min,
      filterValue?.[1] ?? max,
    ])
  }, [filterValue, min, max])

  const handleValueChange = (value: number[]) => {
    setSliderValue([value[0], value[1]])
  }

  const handleValueCommit = (value: number[]) => {
    if (value[0] === min && value[1] === max) {
      column?.setFilterValue(undefined)
    } else {
      column?.setFilterValue(value)
    }
  }

  const handleClear = () => {
    setSliderValue([min, max])
    column?.setFilterValue(undefined)
  }

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='mr-2 h-4 w-4' />
          {title}
          {filterValue && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {formatValue(filterValue[0])} - {formatValue(filterValue[1])}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                <Badge
                  variant='secondary'
                  className='rounded-sm px-1 font-normal'
                >
                  {formatValue(filterValue[0])} - {formatValue(filterValue[1])}
                </Badge>
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-4' align='start'>
        <div className='grid gap-4'>
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium leading-none">{title} Range</Label>
            <span className="text-xs text-muted-foreground">
              {formatValue(sliderValue[0])} - {formatValue(sliderValue[1])}
            </span>
          </div>
          
          <div className='pt-4 pb-2 px-2'>
            <Slider
              value={sliderValue}
              onValueChange={handleValueChange}
              onValueCommit={handleValueCommit}
              min={min}
              max={max}
              step={step}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleClear}
            className='justify-center text-xs mt-2'
          >
            Clear range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
