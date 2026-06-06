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
import { Checkbox } from '@/components/ui/checkbox'
import { useLob, useUpdateLob, useCreateLob } from '@/hooks/use-lobs'
import { Loader2 } from 'lucide-react'
import { useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'branches', label: 'Branches' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'plans', label: 'Plans' },
  { id: 'members', label: 'Members' },
  { id: 'users', label: 'User Management' },
  { id: 'claims', label: 'Claims' },
  { id: 'premiums', label: 'Premiums' },
  { id: 'line-of-business', label: 'Line of Business' },
  { id: 'audit-logs', label: 'Audit Logs' },
]

function generateCode(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const lobFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  enabledModules: z.array(z.string()),
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
      enabledModules: [],
    },
  })

  useEffect(() => {
    if (lob) {
      form.reset({
        name: lob.name,
        code: lob.code,
        description: lob.description || '',
        icon: lob.icon || '',
        enabledModules: lob.config?.enabledModules || ALL_MODULES.map(m => m.id),
      })
    }
  }, [lob, form])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue('name', name)
    if (isNew) {
      form.setValue('code', generateCode(name))
    }
  }, [form, isNew])

  async function onSubmit(data: LobFormValues) {
    const payload: any = {
      name: data.name,
      code: data.code,
      description: data.description || null,
      icon: data.icon || null,
      config: { enabledModules: data.enabledModules },
    }
    if (!isNew) {
      delete payload.code
    }
    if (isNew) {
      await createLob.mutateAsync(payload)
      navigate({ to: '/line-of-business' })
    } else {
      await updateLob.mutateAsync(payload)
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
                      <Input placeholder='e.g. Health Insurance' {...field} onChange={handleNameChange} />
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
                      <Input placeholder='e.g. HEALTH' {...field} disabled={isNew} className={isNew ? 'bg-muted' : ''} />
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

            <div className='rounded-lg bg-muted/50 p-4'>
              <h3 className='mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider'>
                Enabled Modules
              </h3>
              <p className='mb-3 text-xs text-muted-foreground'>
                Select which sidebar modules are available for this line of business.
              </p>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5'>
                {ALL_MODULES.map((mod) => (
                  <FormField
                    key={mod.id}
                    control={form.control}
                    name='enabledModules'
                    render={({ field }) => (
                      <FormItem className='flex items-center gap-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(mod.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, mod.id])
                              } else {
                                field.onChange(current.filter((m) => m !== mod.id))
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className='text-sm font-normal cursor-pointer'>{mod.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
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
