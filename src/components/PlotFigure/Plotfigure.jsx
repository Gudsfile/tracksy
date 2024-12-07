import { useState, useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { queryDB } from '../../db/queries/queryDB'


const PlotFigure = () => {
    const [data, setData] = useState()
    const containerRef = useRef()

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
        queryDB().then(table => setData(table))
    }

    return (
        <div>
            <div ref={containerRef} />{' '}
            <button onClick={updateData}>Update Data</button>
        </div>
    )
}

export default PlotFigure
