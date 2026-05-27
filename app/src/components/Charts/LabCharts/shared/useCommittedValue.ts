import { useEffect, useRef, useState } from 'react'

export function useCommittedValue<TData, TValue>(
    data: TData,
    value: TValue
): TValue {
    const prevDataRef = useRef(data)
    const [committedValue, setCommittedValue] = useState<TValue>(value)

    useEffect(() => {
        if (data !== prevDataRef.current) {
            prevDataRef.current = data
            setCommittedValue(value)
        }
    }, [data, value])

    return committedValue
}
