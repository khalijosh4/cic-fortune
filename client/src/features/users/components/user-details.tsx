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
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useUser, useUpdateUser, useCreateUser, useTransferUser } from '@/hooks/use-users'
import { useBranches } from '@/hooks/use-branches'
import { useHospitals } from '@/hooks/use-hospitals'
import { usePermissions, useUserPermissions, groupPermissionsByResource, getResourceLabel, getActionLabel } from '@/hooks/use-permissions'
import { Loader2, Shield, ArrowRightLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { roles } from '../data/data'
import { useAuthStore } from '@/stores/auth-store'
import { hasPermission } from '@/lib/permissions'

const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  role: z.enum(['admin', 'user', 'hospital', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin']),
  branchId: z.string().optional().nullable(),
  hospitalId: z.string().optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserDetailsProps {
  id?: string
}

const BRANCH_ROLES = ['admin', 'user', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin']
const HOSPITAL_ROLES = ['hospital']

export function UserDetails({ id }: UserDetailsProps) {
  const isNew = !id
  const { data: user, isLoading: userLoading } = useUser(id || '')
  const { data: branchesData } = useBranches(100, 0)
  const { data: hospitalsData } = useHospitals(100, 0)
  const { data: permissionsData, isLoading: permsLoading } = usePermissions()
  const { data: userPermissionIds } = useUserPermissions(id || '', !!id)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const updateUser = useUpdateUser(id || '')
  const createUser = useCreateUser()

  const { auth } = useAuthStore()
  const transferUser = useTransferUser()
  const [transferBranchId, setTransferBranchId] = useState<string>('')

  const allPermissions = permissionsData?.data || []
  const groupedPermissions = groupPermissionsByResource(allPermissions)

  useEffect(() => {
    if (userPermissionIds) {
      setSelectedPermissionIds(userPermissionIds)
    }
  }, [userPermissionIds])

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: 'user',
      branchId: null,
      hospitalId: null,
      password: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'user',
        branchId: user.branchId,
        hospitalId: user.hospitalId,
      })
    }
  }, [user, form])

  function togglePermission(permissionId: string) {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  function onSubmit(data: UserFormValues) {
    const payload = {
      ...data,
      permissionIds: selectedPermissionIds,
    }
    if (isNew) {
      createUser.mutate(payload)
    } else {
      updateUser.mutate(payload)
    }
  }

  if (userLoading && !isNew) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  const selectedRole = form.watch('role')

  return (
    <div className='grid gap-6 lg:grid-cols-3'>
      <div className='lg:col-span-2 space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? 'Create New User' : 'User Details'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 pb-2 border-b'>
                    <div className='size-2 rounded-full bg-primary' />
                    <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                      Personal Information
                    </h3>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    {!isNew && (
                      <FormItem>
                        <Label className='text-sm font-medium text-muted-foreground'>User ID</Label>
                        <FormControl>
                          <Input value={user?.id || ''} disabled className='bg-muted font-mono' />
                        </FormControl>
                      </FormItem>
                    )}
                    <FormField
                      control={form.control}
                      name='firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter first name' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='middleName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter middle name' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter last name' {...field} />
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
                      Contact & Account
                    </h3>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter email address' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='phoneNumber'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder='Enter phone number' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='role'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select role' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {HOSPITAL_ROLES.includes(selectedRole) && (
                      <FormField
                        control={form.control}
                        name='hospitalId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select hospital' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hospitalsData?.data.map((hospital) => (
                                  <SelectItem key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {BRANCH_ROLES.includes(selectedRole) && (
                      <FormField
                        control={form.control}
                        name='branchId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Branch</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select branch' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {branchesData?.data.map((branch) => (
                                  <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {isNew && (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2 pb-2 border-b'>
                      <div className='size-2 rounded-full bg-primary' />
                      <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                        Credentials
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type='password' placeholder='Leave blank for auto-generated password' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className='flex justify-end pt-6 border-t'>
                  <Button type='submit' className='min-w-[150px]' disabled={updateUser.isPending || createUser.isPending || permsLoading}>
                    {updateUser.isPending || createUser.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      isNew ? 'Create User' : 'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permsLoading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : (
              <div className='space-y-4 max-h-[600px] overflow-y-auto'>
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <h4 className='mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                      {getResourceLabel(resource)}
                    </h4>
                    <div className='space-y-2'>
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className='flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors'
                        >
                          <Checkbox
                            checked={selectedPermissionIds.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                            className='mt-0.5'
                          />
                          <div className='space-y-0.5'>
                            <p className='text-sm font-medium leading-none'>
                              {getActionLabel(perm.action)}
                            </p>
                            {perm.description && (
                              <p className='text-xs text-muted-foreground'>
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {!isNew && hasPermission(auth.user?.permissions, 'users.transfer') && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ArrowRightLeft className='h-5 w-5' />
                Transfer Branch
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Transfer this user to a different branch. Their user ID will be regenerated and an email notification will be sent.
              </p>
              <div className='flex gap-3 items-end'>
                <div className='flex-1'>
                  <Label>Destination Branch</Label>
                  <Select onValueChange={setTransferBranchId} value={transferBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select new branch' />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesData?.data
                        .filter(b => b.id !== user?.branchId)
                        .map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant='default'
                  disabled={!transferBranchId || transferUser.isPending}
                  onClick={() => {
                    if (id && transferBranchId) {
                      transferUser.mutate(
                        { id, branchId: transferBranchId },
                        { onSuccess: () => { setTransferBranchId('') } }
                      )
                    }
                  }}
                >
                  {transferUser.isPending ? (
                    <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Transferring...</>
                  ) : (
                    <><ArrowRightLeft className='mr-2 h-4 w-4' /> Transfer User</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
