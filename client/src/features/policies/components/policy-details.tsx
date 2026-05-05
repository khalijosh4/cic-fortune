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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePolicy, useUpdatePolicy, useCreatePolicy } from '@/hooks/use-policies'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const policyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  annualLimit: z.string().min(1, 'Annual limit is required'),
  outpatientLimit: z.string().optional(),
  inpatientLimit: z.string().optional(),
  maternityLimit: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
})

type PolicyFormValues = z.infer<typeof policyFormSchema>

interface PolicyDetailsProps {
  id?: string
}

export function PolicyDetails({ id }: PolicyDetailsProps) {
  const isNew = !id
  const { data: policy, isLoading } = usePolicy(id || '')
  const updatePolicy = useUpdatePolicy(id || '')
  const createPolicy = useCreatePolicy()

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: '',
      annualLimit: '',
      outpatientLimit: '',
      inpatientLimit: '',
      maternityLimit: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (policy) {
      form.reset({
        name: policy.name || '',
        annualLimit: policy.annualLimit || '',
        outpatientLimit: policy.outpatientLimit || '',
        inpatientLimit: policy.inpatientLimit || '',
        maternityLimit: policy.maternityLimit || '',
        status: policy.status || 'active',
      })
    }
  }, [policy, form])

  function onSubmit(data: PolicyFormValues) {
    if (isNew) {
      createPolicy.mutate(data)
    } else {
      updatePolicy.mutate(data)
    }
  }

  if (isLoading && !isNew) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? 'Create New Policy' : 'Policy Details'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter policy name' {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                        <SelectItem value='pending'>Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='annualLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Limit</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter annual limit' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='outpatientLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outpatient Limit</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter outpatient limit' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='inpatientLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inpatient Limit</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter inpatient limit' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='maternityLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maternity Limit</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter maternity limit' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={updatePolicy.isPending || createPolicy.isPending}>
                {updatePolicy.isPending || createPolicy.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Create Policy' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
