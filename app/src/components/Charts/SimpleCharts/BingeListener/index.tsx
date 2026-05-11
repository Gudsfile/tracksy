import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { buildBingeListenerQuery, type BingeListenerResult } from './query'
import { BingeListener as BingeListenerView } from './BingeListener'

export function BingeListener() {
    const { data, isLoading } = useDBQueryFirst<BingeListenerResult>({
        query: buildBingeListenerQuery(),
    })
    return <BingeListenerView data={data} isLoading={isLoading} />
}
