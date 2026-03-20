import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) return null

  try {
    const { user } = await payload.auth({
      collection: 'users',
      headers: new Headers({ Authorization: `JWT ${token}` }),
    } as any)
    return user
  } catch {
    return null
  }
}