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
import { Card, CardContent } from '@/components/ui/card'
import { useLob, useUpdateLob, useCreateLob } from '@/hooks/use-lobs'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

const lobFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
})

type LobFormValues = z.infer<typeof lobFormSchema>

interface LobDetailsProps {
  id?: string
}

export function LobDetails({ id }: LobDetailsProps) {
  const isNew = !id
  const { data: lob, isLoading } = useLob(id || '')
  const updateLob = useUpdateLob(id || '')
  const createLob = useCreateLob()
  const navigate = useNavigate()

  const form = useForm<LobFormValues>({
    resolver: zodResolver(lobFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      icon: '',
    },
  })

  useEffect(() => {
    if (lob) {
      form.reset({
        name: lob.name,
        code: lob.code,
        description: lob.description || '',
        icon: lob.icon || '',
      })
    }
  }, [lob, form])

  async function onSubmit(data: LobFormValues) {
    if (isNew) {
      await createLob.mutateAsync(data as any)
      navigate({ to: '/line-of-business' })
    } else {
      await updateLob.mutateAsync(data as any)
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
      <CardContent className='pt-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {!isNew && (
                <FormItem>
                  <Label className='text-sm font-medium text-muted-foreground'>LOB ID</Label>
                  <FormControl>
                    <Input value={lob?.id || ''} disabled className='bg-muted font-mono' />
                  </FormControl>
                </FormItem>
              )}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Health Insurance' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. HEALTH' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='rounded-lg bg-muted/50 p-4'>
              <h3 className='mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider'>
                Additional Details
              </h3>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe this line of business...'
                          className='resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='icon'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. HeartPulse' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate({ to: '/line-of-business' })}
              >
                Cancel
              </Button>
              <Button type='submit' className='min-w-[120px]' disabled={updateLob.isPending || createLob.isPending}>
                {updateLob.isPending || createLob.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Create LOB' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
