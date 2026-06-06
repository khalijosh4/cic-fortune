import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, Users, FileText } from 'lucide-react'

interface LobSummaryItem {
  id: string
  name: string
  code: string
  icon?: string
  memberCount: number
  claimCount: number
}

export function LOBSummary() {
  const { data, isLoading } = useQuery<{ data: LobSummaryItem[] }>({
    queryKey: ['lobs-summary'],
    queryFn: async () => {
      const res = await api.get('/line-of-business/summary')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }

  const items = data?.data || []

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((lob) => (
        <Card key={lob.id} className='overflow-hidden'>
          <CardHeader className='flex flex-row items-center gap-3 pb-2'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10'>
              <Layers className='size-5 text-primary' />
            </div>
            <div>
              <CardTitle className='text-base'>{lob.name}</CardTitle>
              <p className='text-xs text-muted-foreground'>{lob.code}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <Users className='size-4 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>{lob.memberCount}</p>
                  <p className='text-xs text-muted-foreground'>Members</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <FileText className='size-4 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>{lob.claimCount}</p>
                  <p className='text-xs text-muted-foreground'>Claims</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
