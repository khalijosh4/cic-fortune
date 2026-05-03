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
import { usePolicies } from '@/hooks/use-policies'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const memberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  branchId: z.string().min(1, 'Branch is required'),
  policyId: z.string().min(1, 'Policy is required'),
  coverType: z.string().min(1, 'Cover type is required'),
  premiumRate: z.string().min(1, 'Premium rate is required'),
  status: z.string().min(1, 'Status is required'),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

interface MemberDetailsProps {
  id?: string
}

export function MemberDetails({ id }: MemberDetailsProps) {
  const isNew = !id
  const { data: member, isLoading: memberLoading } = useMember(id || '')
  const { data: branchesData } = useBranches(100, 0)
  const { data: policiesData } = usePolicies(100, 0)
  const updateMember = useUpdateMember(id || '')
  const createMember = useCreateMember()

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      branchId: '',
      policyId: '',
      coverType: '',
      premiumRate: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (member) {
      form.reset({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        branchId: member.branchId || '',
        policyId: member.policyId || '',
        coverType: member.coverType || '',
        premiumRate: member.premiumRate || '',
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                name='policyId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select policy' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policiesData?.data.map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.name}
                          </SelectItem>
                        ))}
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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

            <FormField
              control={form.control}
              name='premiumRate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Rate (KES)</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter premium rate' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end'>
              <Button type='submit' disabled={updateMember.isPending || createMember.isPending}>
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
