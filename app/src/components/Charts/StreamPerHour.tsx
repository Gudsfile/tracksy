import * as Plot from '@observablehq/plot'
import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../db/queries/queryDB'
import { TABLE } from '../../db/queries/constants'
import * as d3 from 'd3'
import { Int } from 'apache-arrow'

const query = `
SELECT
  count(*)::int as count_stream,
  hour(ts::datetime)::int as hour,
  username
FROM ${TABLE}
group by hour(ts::datetime), username
order by hour
`

function buildPlot(data: Awaited<ReturnType<typeof queryDB>>) {
    const longitude = d3
        .scalePoint(new Set(Plot.valueof(data, 'hour')), [180, -180])
        .padding(0.5)
        .align(1)
    const maxCountStream = d3.max(data, (d) => d.count_stream)
    const latitude = d3
        .scaleLinear()
        .domain([maxCountStream, 0])
        .range([0.5, 0])
    return Plot.plot({
        title: 'Streams per hour',
        projection: {
            type: 'azimuthal-equidistant',
            rotate: [0, -90],
            domain: d3.geoCircle().center([0, 90]).radius(0.625)(),
        },
        color: { legend: true },
        marks: [
            // grey discs
            Plot.geo([0.5, 0.4, 0.3, 0.2, 0.1], {
                geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
                stroke: 'black',
                fill: 'black',
                strokeOpacity: 0.3,
                fillOpacity: 0.03,
                strokeWidth: 0.5,
            }),
            // white axes
            Plot.link(longitude.domain(), {
                x1: longitude,
                y1: 90 - 0.57,
                x2: 0,
                y2: 90,
                stroke: 'white',
                strokeOpacity: 0.5,
                strokeWidth: 2.5,
            }),
            // hours
            Plot.text(longitude.domain(), {
                x: longitude,
                y: 90 - 0.57,
                text: (d) => `${String(d).padStart(2, '0')}`,
                lineWidth: 5,
                className: 'stream-per-hour-hours-text',
            }),
            // areas
            Plot.area(data, {
                x1: ({ hour }) => longitude(hour),
                y1: ({ count_stream }) => 90 - latitude(count_stream),
                x2: 0,
                y2: 90,
                fill: 'username',
                stroke: 'username',
                curve: 'cardinal-closed',
                fillOpacity: 0.3,
            }),
            // points
            Plot.dot(data, {
                x: ({ hour }) => longitude(hour),
                y: ({ count_stream }) => 90 - latitude(count_stream),
                fill: 'username',
                stroke: 'white',
                className: 'stream-per-hour-points',
            }),
            // interactive labels
            Plot.text(
                data,
                Plot.pointer({
                    x: ({ hour }) => longitude(hour),
                    y: ({ count_stream }) => 90 - latitude(count_stream),
                    text: (d) => `${d.count_stream.toLocaleString()} stream(s)`,
                    textAnchor: 'start',
                    dx: 4,
                    fill: 'currentColor',
                    stroke: 'white',
                    maxRadius: 10,
                })
            ),
        ],
    })
}

export function StreamPerHour() {
    const [data, setData] = useState<
        Awaited<ReturnType<typeof queryDB>> | undefined
    >()

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getData = async () => {
            const result = await queryDB(query)
            setData(result)
        }
        getData()
    }, [])

    useEffect(() => {
        let element: ReturnType<typeof buildPlot> | undefined

        if (data !== undefined) {
            element = buildPlot(data)
            containerRef.current?.append(element)
        }
        return () => {
            element?.remove()
        }
    }, [data])

    return data && <div ref={containerRef} />
}
