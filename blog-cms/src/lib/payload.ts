import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getPayloadClient() {
  const payload = await getPayload({ config: configPromise })
  return payload
}