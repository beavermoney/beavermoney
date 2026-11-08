import { LOCAL_STORAGE_TOKEN_KEY } from '@/constant'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const SearchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/auth/callback/')({
  component: RouteComponent,
  validateSearch: (search) => SearchSchema.parse(search),
})

function RouteComponent() {
  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, Route.useSearch().token)

  return <Navigate to="/household" />
}
