import type { FC } from 'react'

type Props = {
    message?: string
}

export const ChartCardEmpty: FC<Props> = ({
    message = 'No data for this year',
}) => (
    <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-6">
        {message}
    </p>
)
