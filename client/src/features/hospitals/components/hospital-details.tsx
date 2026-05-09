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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHospital, useUpdateHospital, useCreateHospital } from '@/hooks/use-hospitals'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const hospitalTypes = [
  { value: 'private', label: 'Private Hospital' },
  { value: 'county', label: 'County Hospital' },
  { value: 'teaching', label: 'Teaching & Referral' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'specialist', label: 'Specialist Hospital' },
  { value: 'referral', label: 'Referral Hospital' },
  { value: 'public', label: 'Public Hospital' },
]

const hospitalFormSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Hospital type is required'),
  claimLimit: z.string().min(1, 'Claim limit is required'),
})

type HospitalFormValues = z.infer<typeof hospitalFormSchema>

interface HospitalDetailsProps {
  id?: string
}

export function HospitalDetails({ id }: HospitalDetailsProps) {
  const isNew = !id
  const { data: hospital, isLoading } = useHospital(id || '')
  const updateHospital = useUpdateHospital(id || '')
  const createHospital = useCreateHospital()

  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: '',
      location: '',
      type: '',
      claimLimit: '',
    },
  })

  useEffect(() => {
    if (hospital) {
      form.reset({
        name: hospital.name || '',
        location: hospital.location || '',
        type: hospital.type || '',
        claimLimit: hospital.claimLimit || '',
      })
    }
  }, [hospital, form])

  function onSubmit(data: HospitalFormValues) {
    if (isNew) {
      createHospital.mutate(data)
    } else {
      updateHospital.mutate(data)
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
        <CardTitle>{isNew ? 'Register New Hospital' : 'Hospital Details'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  General Information
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {!isNew && (
                  <FormItem>
                    <Label className='text-sm font-medium text-muted-foreground'>Hospital ID</Label>
                    <FormControl>
                      <Input value={hospital?.id || ''} disabled className='bg-muted font-mono' />
                    </FormControl>
                  </FormItem>
                )}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Kenyatta National Hospital' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Nairobi, Kenya' {...field} />
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
                  Service Configuration
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hospitalTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='claimLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Limit (KES)</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='e.g. 1000000' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-end pt-6 border-t'>
              <Button type='submit' className='min-w-[150px]' disabled={updateHospital.isPending || createHospital.isPending}>
                {updateHospital.isPending || createHospital.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Register Hospital' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
