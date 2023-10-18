import { useState } from 'react'

const useLocalStorage = <T>(key: string, initialValue: T): any => {
    const [storedValue, setStoredValue] = useState<T>((): any => {
        if (typeof window === 'undefined') {
            return initialValue
        }
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            return initialValue
        }
    })
    const setValue = (value: T | ((val: T) => T)): any => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            return
        }
    }
    return [storedValue, setValue] as const
}

export default useLocalStorage
