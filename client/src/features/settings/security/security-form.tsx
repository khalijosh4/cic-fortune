import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { useAuthStore } from '@/stores/auth-store'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import api from '@/lib/api'
import { Separator } from '@/components/ui/separator'

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
  confirmPassword: z.string().min(1, 'Please confirm your new password.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

export function SecurityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = useAuthStore((state) => state.auth.user)

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: SecurityFormValues) {
    setIsSubmitting(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      toast.success('Password updated successfully!')

      if (user?.mustChangePassword) {
        useAuthStore.getState().auth.setUser({
          ...user,
          mustChangePassword: false,
        })
      }

      form.reset()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {user?.mustChangePassword && (
          <Alert variant='destructive' className='bg-destructive/10 text-destructive border-destructive/20'>
            <ShieldAlert className='h-4 w-4' />
            <AlertTitle>Password Change Required</AlertTitle>
            <AlertDescription>
              For your security, you must change your temporary password before you can continue using the system.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='flex h-2 w-2 rounded-full bg-primary' />
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Current Credentials
            </span>
          </div>
          <Separator className='mb-6' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
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
              New Password
            </span>
          </div>
          <Separator className='mb-6' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters with uppercase, lowercase, and a number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='border-t pt-6'>
          <Button type='submit' disabled={isSubmitting} className='min-w-[150px]'>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
