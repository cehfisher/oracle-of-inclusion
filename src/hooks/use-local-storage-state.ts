import { Dispatch, SetStateAction, useEffect, useState } from 'react'

const readStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue

  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue === null ? defaultValue : JSON.parse(storedValue) as T
  } catch (error) {
    console.warn(`Unable to read local storage key "${key}"`, error)
    return defaultValue
  }
}

export const useLocalStorageState = <T,>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => readStoredValue(key, defaultValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Unable to write local storage key "${key}"`, error)
    }
  }, [key, value])

  return [value, setValue]
}
