import { useEffect, useState } from 'react'

// Only the API address is configured in the browser. Database credentials
// stay in backend/.env and never reach the frontend.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/** GET a JSON endpoint. Throws an Error with a readable message on failure. */
export async function fetchJson<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(API_BASE_URL + path)
  } catch {
    throw new Error(`Cannot reach the API at ${API_BASE_URL}. Is the FastAPI server running?`)
  }

  if (!response.ok) {
    // FastAPI sends errors as {"detail": "..."}
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? `Request failed with status ${response.status}`)
  }
  return response.json()
}

/** Load an endpoint when the component mounts. data and error start as null. */
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If the component unmounts before the response arrives, ignore the response
    let ignore = false
    fetchJson<T>(path)
      .then((result) => {
        if (!ignore) setData(result)
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message)
      })
    return () => {
      ignore = true
    }
  }, [path])

  return { data, error }
}

