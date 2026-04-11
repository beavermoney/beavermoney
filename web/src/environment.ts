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

const fetchGraphQL: FetchFunction = async (request, variables) => {
  const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
  const householdId = localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)
  const displayCurrencyId = localStorage.getItem(
    LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY,
  )

  const resp = await ky
    .post(HTTP_ENDPOINT + '/query', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(householdId ? { 'X-Household-ID': householdId } : {}),
        ...(displayCurrencyId
          ? { 'X-Display-Currency-ID': displayCurrencyId }
          : {}),
      },
      json: { query: request.text, variables },
    })
    .json<GraphQLResponse>()
  return resp
}

export const environment = new Environment({
  network: Network.create(fetchGraphQL),
})
