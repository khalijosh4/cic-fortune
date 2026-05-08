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
import { useBranch, useUpdateBranch, useCreateBranch } from '@/hooks/use-branches'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const branchFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  manager: z.string().optional(),
})

type BranchFormValues = z.infer<typeof branchFormSchema>

interface BranchDetailsProps {
  id?: string
}

export function BranchDetails({ id }: BranchDetailsProps) {
  const isNew = !id
  const { data: branch, isLoading } = useBranch(id || '')
  const updateBranch = useUpdateBranch(id || '')
  const createBranch = useCreateBranch()

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      location: '',
      manager: '',
    },
  })

  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name,
        location: branch.location,
        manager: branch.manager,
      })
    }
  }, [branch, form])

  function onSubmit(data: BranchFormValues) {
    if (isNew) {
      createBranch.mutate(data)
    } else {
      updateBranch.mutate(data)
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
        <CardTitle>{isNew ? 'Create New Branch' : 'Branch Details'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Headquarters' {...field} />
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

            <div className='rounded-lg bg-muted/50 p-4'>
              <h3 className='mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider'>
                Administration (Optional)
              </h3>
              <FormField
                control={form.control}
                name='manager'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Manager</FormLabel>
                    <FormControl>
                      <Input placeholder='Select or enter manager name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end pt-4 border-t'>
              <Button type='submit' className='min-w-[120px]' disabled={updateBranch.isPending || createBranch.isPending}>
                {updateBranch.isPending || createBranch.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Create Branch' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
