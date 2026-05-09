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
import { useBranch, useUpdateBranch, useCreateBranch } from '@/hooks/use-branches'
import { useAvailableManagers, User } from '@/hooks/use-users'
import { SelectDropdown } from '@/components/select-dropdown'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  const { data: availableManagers, isLoading: isLoadingManagers } = useAvailableManagers(branch?.manager || undefined)
  const updateBranch = useUpdateBranch(id || '')
  const createBranch = useCreateBranch()

  const [pendingManager, setPendingManager] = useState<User | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

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
    const payload = {
      ...data,
      manager: data.manager === 'none' ? null : data.manager,
    }
    if (isNew) {
      createBranch.mutate(payload as any)
    } else {
      updateBranch.mutate(payload as any)
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'Create New Branch' : 'Branch Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {!isNew && (
                <FormItem>
                  <Label className='text-sm font-medium text-muted-foreground'>Branch ID</Label>
                  <FormControl>
                    <Input value={branch?.id || ''} disabled className='bg-muted font-mono' />
                  </FormControl>
                </FormItem>
              )}
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
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={(val) => {
                          if (val === 'none') {
                            field.onChange(val)
                            return
                          }
                          const selectedUser = availableManagers?.find(m => m.id === val)
                          if (selectedUser) {
                            const needsTransfer = selectedUser.branchId !== id
                            const needsPromotion = selectedUser.role !== 'branch_manager'
                            
                            if (needsTransfer || needsPromotion) {
                              setPendingManager(selectedUser)
                              setShowConfirm(true)
                            } else {
                              field.onChange(val)
                            }
                          }
                        }}
                        placeholder={isLoadingManagers ? 'Loading managers...' : 'Select a manager'}
                        items={[
                          { label: 'None (Unassigned)', value: 'none' },
                          ...(availableManagers?.map((m) => ({
                            label: `${m.firstName} ${m.lastName} (${m.email})`,
                            value: m.id,
                          })) || []),
                        ]}
                      />
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

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={
          <div className='flex items-center gap-2 text-warning'>
            <AlertCircle className='h-5 w-5' />
            User Transfer & Promotion Required
          </div>
        }
        desc={
          <div className='space-y-3 pt-2'>
            <p>
              You are assigning <strong>{pendingManager?.firstName} {pendingManager?.lastName}</strong> as the manager for this branch.
            </p>
            <div className='rounded-md bg-muted p-3 text-sm space-y-2'>
              <p>• The user's role will be changed to <strong>Branch Manager</strong>.</p>
              <p>• The user will be moved to the <strong>{form.getValues('name') || 'this'}</strong> branch.</p>
              <p>• Their <strong>ID will be re-generated</strong> to reflect their new branch assignment.</p>
            </div>
            <p className='text-sm text-muted-foreground'>
              Are you sure you want to proceed with these changes?
            </p>
          </div>
        }
        confirmText='Transfer & Promote'
        handleConfirm={() => {
          if (pendingManager) {
            form.setValue('manager', pendingManager.id)
          }
          setShowConfirm(false)
        }}
      />
    </>
  )
}
