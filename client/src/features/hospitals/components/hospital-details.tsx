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
import { useHospital, useUpdateHospital, useCreateHospital } from '@/hooks/use-hospitals'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const hospitalFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Type is required'),
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {!isNew && (
                <FormItem>
                  <FormLabel>Hospital ID</FormLabel>
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
                      <Input placeholder='Enter hospital name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter location' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter hospital type' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='claimLimit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Limit</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter claim limit' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className='flex justify-end'>
              <Button type='submit' disabled={updateHospital.isPending || createHospital.isPending}>
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
