import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = useAuthStore((state) => state.auth.user)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
    mode: 'onChange',
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true)
    try {
      const response = await api.put('/auth/profile', {
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
      })

      useAuthStore.getState().auth.setUser({
        ...user!,
        firstName: response.data.firstName,
        middleName: response.data.middleName,
        lastName: response.data.lastName,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
      })

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='flex h-2 w-2 rounded-full bg-primary' />
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Account Information
            </span>
          </div>
          <Separator className='mb-6' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
            <div className='flex flex-col gap-1'>
              <Label className='text-sm font-medium text-muted-foreground'>User ID</Label>
              <div className='text-sm font-mono'>{user?.id || '—'}</div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-sm font-medium text-muted-foreground'>Role</Label>
              <div className='text-sm capitalize'>{user?.role || '—'}</div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-sm font-medium text-muted-foreground'>Branch</Label>
              <div className='text-sm'>{user?.branchId || '—'}</div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-sm font-medium text-muted-foreground'>Hospital</Label>
              <div className='text-sm'>{user?.hospitalId || '—'}</div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-sm font-medium text-muted-foreground'>Force Password Change</Label>
              <div className='text-sm'>
                <Badge variant={user?.mustChangePassword ? 'destructive' : 'secondary'}>
                  {user?.mustChangePassword ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='flex h-2 w-2 rounded-full bg-primary' />
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Personal Information
            </span>
          </div>
          <Separator className='mb-6' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John' {...field} />
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
                    <Input placeholder='(optional)' {...field} />
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
                    <Input placeholder='Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='flex h-2 w-2 rounded-full bg-primary' />
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Contact & Account
            </span>
          </div>
          <Separator className='mb-6' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder='john.doe@example.com' {...field} />
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
                    <Input placeholder='+254...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='border-t pt-6'>
          <Button type='submit' disabled={isSubmitting} className='min-w-[150px]'>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

