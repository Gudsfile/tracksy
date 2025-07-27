import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import type { Table } from 'apache-arrow'
import type { QueryResult } from './query'

export function buildPlotWrapper(maxValue: number) {
    return (data: Table<QueryResult> | undefined) => buildPlot(data, maxValue)
}

function buildPlot(
    data?: Table<QueryResult>,
    maxValue?: number
): ReturnType<typeof Plot.plot> | undefined {
    if (!data) return undefined
    const longitude = d3
        .scalePoint(new Set(Plot.valueof(data, 'hour')), [180, -180])
        .padding(0.5)
        .align(1)
    const maxCountStream = maxValue || d3.max(data, (d) => d.count_stream)
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
                fill: true,
                stroke: true,
                curve: 'cardinal-closed',
                fillOpacity: 0.3,
            }),
            // points
            Plot.dot(data, {
                x: ({ hour }) => longitude(hour),
                y: ({ count_stream }) => 90 - latitude(count_stream),
                fill: true,
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
