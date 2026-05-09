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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClaim, useUpdateClaim } from '@/hooks/use-claims'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const claimFormSchema = z.object({
  amountClaimed: z.string().min(1, 'Amount claimed is required'),
  amountApproved: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  diagnosis: z.string().optional(),
})

type ClaimFormValues = z.infer<typeof claimFormSchema>

interface ClaimDetailsProps {
  id: string
}

export function ClaimDetails({ id }: ClaimDetailsProps) {
  const { data: claim, isLoading } = useClaim(id)
  const updateClaim = useUpdateClaim(id)

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      amountClaimed: '',
      amountApproved: '',
      status: 'pending',
      diagnosis: '',
    },
  })

  useEffect(() => {
    if (claim) {
      form.reset({
        amountClaimed: claim.amountClaimed || '',
        amountApproved: claim.amountApproved || '',
        status: claim.status || 'pending',
        diagnosis: claim.diagnosis || '',
      })
    }
  }, [claim, form])

  function onSubmit(data: ClaimFormValues) {
    updateClaim.mutate(data)
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
        <CardTitle>Claim Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Section: Financial Details */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Financial Details
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <FormItem>
                  <Label className='text-sm font-medium text-muted-foreground'>Claim ID</Label>
                  <FormControl>
                    <Input value={claim?.id || ''} disabled className='bg-muted font-mono' />
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name='amountClaimed'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Claimed (KES)</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter amount claimed' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amountApproved'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Approved (KES)</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter amount approved' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Status & Diagnosis */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Claim Status & Medical Info
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='pending'>Pending Review</SelectItem>
                          <SelectItem value='approved'>Approved</SelectItem>
                          <SelectItem value='rejected'>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='hidden md:block' /> {/* Spacer */}
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name='diagnosis'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis / Treatment Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='Provide detailed medical diagnosis or treatment notes...' 
                            className='min-h-[120px] resize-none'
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end pt-6 border-t'>
              <Button type='submit' className='min-w-[150px]' disabled={updateClaim.isPending}>
                {updateClaim.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Update Claim'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
