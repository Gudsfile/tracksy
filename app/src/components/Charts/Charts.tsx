import { StreamPerMonth } from './StreamPerMonth'
import { StreamPerHour } from './StreamPerHour'
import { SummaryPerYear } from './SummaryPerYear'

export function Charts() {
    return (
        <>
            <StreamPerMonth />
            <StreamPerHour />
            <SummaryPerYear />
        </>
    )
}
