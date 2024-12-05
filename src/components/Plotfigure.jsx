import { useState, useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { queryDb } from '../db/queries/queryFilesInDatabase'

const PlotFigure = () => {
    const containerRef = useRef()
    const [data, setData] = useState()

    useEffect(() => {
        console.log('coucou')
        queryDb().then(setData)
    }, [])

    useEffect(() => {
        if (data === undefined) return
        const plot = Plot.plot({
            x: { type: 'utc' },
            y: { grid: true },
            color: { legend: true, type: 'categorical' },
            marks: [
                Plot.ruleY([0]),
                Plot.rectY(
                    data,
                    Plot.binX(
                        { y: 'sum' },
                        { x: 'ts', y: 'ms_played', fill: 'username', tip: true }
                    )
                ),
            ],
        })
        containerRef.current.append(plot)
        return () => plot.remove()
    }, [data])

    const updateData = () => {
        queryDb().then(setData)
    }

    return (
        <div>
            <div ref={containerRef} />{' '}
            <button onClick={updateData}>Update Data</button>
        </div>
    )
}

export default PlotFigure
