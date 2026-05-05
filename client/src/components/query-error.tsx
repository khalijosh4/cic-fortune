import { isAxiosError } from 'axios'
import { ForbiddenError } from '@/features/errors/forbidden'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { UnauthorisedError } from '@/features/errors/unauthorized-error'

interface QueryErrorProps {
  error: unknown
}

export function QueryError({ error }: QueryErrorProps) {
  if (isAxiosError(error)) {
    const status = error.response?.status

    switch (status) {
      case 401:
        return <UnauthorisedError />
      case 403:
        return <ForbiddenError />
      case 404:
        return <NotFoundError />
      default:
        return <GeneralError />
    }
  }

  return <GeneralError />
}
