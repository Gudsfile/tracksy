import { getDB } from '../getDB'

import type { DataType, Table } from 'apache-arrow'

export async function queryDB<T extends { [key: string]: DataType }>(
    query: string
): Promise<Table<T>> {
    const { conn } = await getDB()

    return conn.query<T>(query)
}
