import { LOCAL_STORAGE_TOKEN_KEY } from '@/constant'
import { redirect, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const SearchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/auth/callback/')({
  validateSearch: (search) => SearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, search.token)
    throw redirect({ to: '/household', replace: true })
  },
})
