import { TopStreak } from './TopStreak'
import { TotalStreams } from './TotalStreams'
import { TopArtist } from './TopArtist'
import { ConcentrationScore } from './SimpleCharts/ConcentrationScore'
import { ListeningRhythm } from './SimpleCharts/ListeningRhythm'
import { Regularity } from './SimpleCharts/Regularity'
import { SeasonalPatterns } from './SimpleCharts/SeasonalPatterns'
import { EvolutionOverTime } from './SimpleCharts/EvolutionOverTime'
import { NewVsOld } from './SimpleCharts/NewVsOld'
import { SkipRate } from './SimpleCharts/SkipRate'
import { RepeatBehavior } from './SimpleCharts/RepeatBehavior'
import { FunFacts } from './SimpleCharts/FunFacts'
import { PrincipalPlatform } from './SimpleCharts/PrincipalPlatform'
import { DiversityScore } from './SimpleCharts/DiversityScore'
import { FavoriteWeekday } from './SimpleCharts/FavoriteWeekday'

export function SimpleView() {
    return (
        <>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <TopStreak />
                <TotalStreams />
                <TopArtist />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ConcentrationScore />
                <DiversityScore />
                <ListeningRhythm />
                <Regularity />
                <div className="md:col-span-2">
                    <EvolutionOverTime />
                </div>
                <SeasonalPatterns />
                <NewVsOld />
                <SkipRate />
                <RepeatBehavior />
                <PrincipalPlatform />
                <FavoriteWeekday />
            </div>
            <div className="mt-4">
                <FunFacts />
            </div>
        </>
    )
}
