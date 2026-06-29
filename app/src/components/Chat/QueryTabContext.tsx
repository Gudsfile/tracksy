import { createContext, useContext } from 'react'

export const QueryTabContext = createContext<(sql: string) => void>(() => {})
export const useQueryTab = () => useContext(QueryTabContext)
