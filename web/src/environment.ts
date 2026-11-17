import { handleHouseholdError } from './lib/auth'
import { Environment, Network } from 'relay-runtime'
import { env } from './env'
import {
  LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY,
  LOCAL_STORAGE_HOUSEHOLD_ID_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
} from './constant'
import type { FetchFunction, GraphQLResponse } from 'relay-runtime'
import ky from 'ky'

const HTTP_ENDPOINT = env.VITE_SERVER_URL

export const fetchGraphQL: FetchFunction = async (request, variables) => {
  const query = request.text
  if (!query) throw new Error('GraphQL operation text is required for APQ')

  const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
  const householdId = localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)
  const displayCurrencyId = localStorage.getItem(
    LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY,
  )

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(householdId ? { 'X-Household-ID': householdId } : {}),
    ...(displayCurrencyId
      ? { 'X-Display-Currency-ID': displayCurrencyId }
      : {}),
  }
  const send = async (json: object) => {
    const response = await ky
      .post(HTTP_ENDPOINT + '/query', { headers, json })
      .json<GraphQLResponse>()
    if (request.operationKind === 'query' && 'errors' in response)
      response.errors?.forEach((error) =>
        handleHouseholdError(new Error(error.message)),
      )
    return response
  }
  const operation = { operationName: request.name, variables }

  // Web Crypto is unavailable on insecure origins (for example, LAN dev URLs).
  if (!globalThis.crypto?.subtle) return send({ ...operation, query })

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(query),
  )
  const sha256Hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  const extensions = { persistedQuery: { version: 1, sha256Hash } }
  const response = await send({ ...operation, extensions })

  // Retry only a pre-execution cache miss, never an operation execution error.
  if (
    (!('data' in response) || response.data === null) &&
    'errors' in response &&
    response.errors?.some(
      (error) =>
        'extensions' in error &&
        error.extensions !== null &&
        typeof error.extensions === 'object' &&
        'code' in error.extensions &&
        error.extensions.code === 'PERSISTED_QUERY_NOT_FOUND',
    )
  ) {
    return send({ ...operation, extensions, query })
  }
  return response
}

export const environment = new Environment({
  network: Network.create(fetchGraphQL),
})
