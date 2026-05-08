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
import { useMember, useUpdateMember, useCreateMember } from '@/hooks/use-members'
import { useBranches } from '@/hooks/use-branches'
import { usePlans } from '@/hooks/use-plans'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const memberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  branchId: z.string().min(1, 'Branch is required'),
  planId: z.string().min(1, 'Plan is required'),
  coverType: z.string().min(1, 'Cover type is required'),
  dependentsCount: z.coerce.number().min(0, 'Dependents count cannot be negative'),
  status: z.string().min(1, 'Status is required'),
})

interface MemberFormValues {
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
  branchId: string
  planId: string
  coverType: string
  dependentsCount: number
  status: string
}

interface MemberDetailsProps {
  id?: string
}

export function MemberDetails({ id }: MemberDetailsProps) {
  const isNew = !id
  const { data: member, isLoading: memberLoading } = useMember(id || '')
  const { data: branchesData } = useBranches(100, 0)
  const { data: plansData } = usePlans(100, 0)
  const updateMember = useUpdateMember(id || '')
  const createMember = useCreateMember()
  const authUser = useAuthStore((state) => state.auth.user)
  const isClaimsOfficer = authUser?.role === 'claims_officer'

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      branchId: '',
      planId: '',
      coverType: '',
      dependentsCount: 0,
      status: 'active',
    },
  })

  useEffect(() => {
    if (member) {
      form.reset({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phoneNumber: member.phoneNumber || '',
        branchId: member.branchId || '',
        planId: member.planId || '',
        coverType: member.coverType || '',
        dependentsCount: member.dependentsCount || 0,
        status: member.status || 'active',
      })
    }
  }, [member, form])

  function onSubmit(data: MemberFormValues) {
    if (isNew) {
      createMember.mutate(data)
    } else {
      updateMember.mutate(data)
    }
  }

  if (memberLoading && !isNew) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? 'Enroll New Member' : 'Member Details'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Section: Personal Details */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Personal Details
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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

            {/* Section: Contact Information */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Contact Information
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder='member@example.com' {...field} />
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
                        <Input placeholder='e.g. 0712345678' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Policy & Coverage */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <div className='size-2 rounded-full bg-primary' />
                <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
                  Policy & Coverage
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='branchId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select branch' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branchesData?.data.map((branch) => (
                            <SelectItem key={branch.branchId} value={branch.branchId}>
                              {branch.branchName}
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
                  name='planId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selected Plan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select plan' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plansData?.data.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.planName}
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
                  name='coverType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select cover type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='individual'>Individual</SelectItem>
                          <SelectItem value='family'>Family</SelectItem>
                          <SelectItem value='corporate'>Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dependentsCount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dependents Count</FormLabel>
                      <FormControl>
                        <Input 
                          type='number' 
                          placeholder='0' 
                          {...field} 
                          disabled={!isNew && isClaimsOfficer}
                        />
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
                      <FormLabel>Account Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='active'>Active</SelectItem>
                          <SelectItem value='expired'>Expired</SelectItem>
                          <SelectItem value='pending'>Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-end pt-6 border-t'>
              <Button type='submit' className='min-w-[150px]' disabled={updateMember.isPending || createMember.isPending}>
                {updateMember.isPending || createMember.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  isNew ? 'Enroll Member' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
