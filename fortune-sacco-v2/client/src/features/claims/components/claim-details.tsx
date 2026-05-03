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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='pending'>Pending</SelectItem>
                        <SelectItem value='approved'>Approved</SelectItem>
                        <SelectItem value='rejected'>Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name='diagnosis'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis / Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter diagnosis' {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end'>
              <Button type='submit' disabled={updateClaim.isPending}>
                {updateClaim.isPending ? (
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
