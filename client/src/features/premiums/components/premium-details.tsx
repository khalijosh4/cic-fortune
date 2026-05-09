import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePremium, useUpdatePremium } from '@/hooks/use-premiums'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const premiumFormSchema = z.object({
  amountDue: z.string().min(1, 'Amount due is required'),
  amountPaid: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentMethod: z.string().optional(),
})

type PremiumFormValues = z.infer<typeof premiumFormSchema>

interface PremiumDetailsProps {
  id: string
}

export function PremiumDetails({ id }: PremiumDetailsProps) {
  const { data: premium, isLoading } = usePremium(id)
  const updatePremium = useUpdatePremium(id)

  const form = useForm<PremiumFormValues>({
    resolver: zodResolver(premiumFormSchema),
    defaultValues: {
      amountDue: '',
      amountPaid: '',
      dueDate: '',
      paymentMethod: '',
    },
  })

  useEffect(() => {
    if (premium) {
      form.reset({
        amountDue: premium.amountDue || '',
        amountPaid: premium.amountPaid || '',
        dueDate: premium.dueDate ? new Date(premium.dueDate).toISOString().split('T')[0] : '',
        paymentMethod: premium.paymentMethod || '',
      })
    }
  }, [premium, form])

  function onSubmit(data: PremiumFormValues) {
    updatePremium.mutate(data)
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Payment Information
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormItem>
                  <Label className='text-sm font-medium text-muted-foreground'>Premium ID</Label>
                  <FormControl>
                    <Input value={premium?.id || ''} disabled className='bg-muted font-mono' />
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name='amountDue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Due (KES)</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter amount due' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amountPaid'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid (KES)</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter amount paid' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Schedule & Method
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='paymentMethod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select payment method' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='mpesa'>M-Pesa</SelectItem>
                          <SelectItem value='bank'>Bank Transfer</SelectItem>
                          <SelectItem value='cash'>Cash</SelectItem>
                          <SelectItem value='check'>Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-end pt-6 border-t'>
              <Button type='submit' className='min-w-[150px]' disabled={updatePremium.isPending}>
                {updatePremium.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
