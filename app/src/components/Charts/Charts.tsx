import { StreamPerMonth } from './StreamPerMonth/StreamPerMonth'
import { StreamPerHour } from './StreamPerHour/StreamPerHour'

export function Charts() {
    return (
        <>
            <StreamPerMonth />
            <StreamPerHour />
        </>
    )
}
