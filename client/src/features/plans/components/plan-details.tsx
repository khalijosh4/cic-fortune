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
import { usePlan, useUpdatePlan, useCreatePlan } from '@/hooks/use-plans'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const planFormSchema = z.object({
  planName: z.string().min(1, 'Plan name is required'),
  inpatientLimit: z.string().min(1, 'Inpatient limit is required'),
  outpatientLimit: z.string().min(1, 'Outpatient limit is required'),
  maternityLimit: z.string().optional().nullable(),
  dentalLimit: z.string().optional().nullable(),
  opticalLimit: z.string().optional().nullable(),
  lastExpenseLimit: z.string().optional().nullable(),
  m0: z.string().min(1, 'M0 rate is required'),
  m1: z.string().min(1, 'M1 rate is required'),
  m2: z.string().min(1, 'M2 rate is required'),
  m3: z.string().min(1, 'M3 rate is required'),
  m4: z.string().min(1, 'M4 rate is required'),
  m5: z.string().min(1, 'M5 rate is required'),
  m6: z.string().min(1, 'M6 rate is required'),
  extra: z.string().min(1, 'Extra rate is required'),
})

type PlanFormValues = z.infer<typeof planFormSchema>

interface PlanDetailsProps {
  id?: string
}

export function PlanDetails({ id }: PlanDetailsProps) {
  const isNew = !id
  const { data: plan, isLoading } = usePlan(id || '')
  const updatePlan = useUpdatePlan(id || '')
  const createPlan = useCreatePlan()

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: '',
      inpatientLimit: '',
      outpatientLimit: '',
      maternityLimit: '',
      dentalLimit: '',
      opticalLimit: '',
      lastExpenseLimit: '',
      m0: '',
      m1: '',
      m2: '',
      m3: '',
      m4: '',
      m5: '',
      m6: '',
      extra: '',
    },
  })

  useEffect(() => {
    if (plan) {
      form.reset({
        planName: plan.planName || '',
        inpatientLimit: plan.inpatientLimit || '',
        outpatientLimit: plan.outpatientLimit || '',
        maternityLimit: plan.maternityLimit || '',
        dentalLimit: plan.dentalLimit || '',
        opticalLimit: plan.opticalLimit || '',
        lastExpenseLimit: plan.lastExpenseLimit || '',
        m0: plan.m0 || '',
        m1: plan.m1 || '',
        m2: plan.m2 || '',
        m3: plan.m3 || '',
        m4: plan.m4 || '',
        m5: plan.m5 || '',
        m6: plan.m6 || '',
        extra: plan.extra || '',
      })
    }
  }, [plan, form])

  function onSubmit(data: PlanFormValues) {
    if (isNew) {
      createPlan.mutate(data)
    } else {
      updatePlan.mutate(data)
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
        <CardTitle>{isNew ? 'Create New Plan' : 'Plan Details'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>General Information</h3>
              <FormField
                control={form.control}
                name='planName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Gold Executive' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4 pt-4 border-t'>
              <h3 className='text-lg font-semibold'>Benefit Limits (KES)</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='inpatientLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inpatient Limit</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
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
                        <Input type='number' {...field} />
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
                      <FormLabel>Maternity Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dentalLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dental Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='opticalLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optical Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastExpenseLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Expense Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='space-y-4 pt-4 border-t'>
              <h3 className='text-lg font-semibold'>Annual Premiums by Family Size (KES)</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <FormField
                  control={form.control}
                  name='m0'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M (Single)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='m1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M+1</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='m2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M+2</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='m3'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M+3</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='m4'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M+4</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='m5'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M+5</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='m6'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M+6</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='extra'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Child</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-end pt-4 border-t'>
              <Button type='submit' disabled={updatePlan.isPending || createPlan.isPending}>
                {updatePlan.isPending || createPlan.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Create Plan' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
