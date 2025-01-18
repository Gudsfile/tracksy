import { render } from '@testing-library/react'
import { it, vi } from 'vitest'

import * as DB from '../../db/queries/queryDB'

import { ChartWrapper } from './ChartWrapper'

const queryResult = {
    schema: {
        fields: [
            {
                name: 'ms_played',
                type: {
                    typeId: 3,
                    precision: 2,
                },
                nullable: true,
                metadata: {},
            },
            {
                name: 'ts',
                type: {
                    typeId: 8,
                    unit: 0,
                },
                nullable: true,
                metadata: {},
            },
            {
                name: 'username',
                type: {
                    typeId: 5,
                },
                nullable: true,
                metadata: {},
            },
        ],
        metadata: {},
        dictionaries: {},
        metadataVersion: 4,
    },
    batches: [
        {
            schema: {
                fields: [
                    {
                        name: 'ms_played',
                        type: {
                            typeId: 3,
                            precision: 2,
                        },
                        nullable: true,
                        metadata: {},
                    },
                    {
                        name: 'ts',
                        type: {
                            typeId: 8,
                            unit: 0,
                        },
                        nullable: true,
                        metadata: {},
                    },
                    {
                        name: 'username',
                        type: {
                            typeId: 5,
                        },
                        nullable: true,
                        metadata: {},
                    },
                ],
                metadata: {},
                dictionaries: {},
                metadataVersion: 4,
            },
            data: {
                type: {
                    typeId: 13,
                    children: [
                        {
                            name: 'ms_played',
                            type: {
                                typeId: 3,
                                precision: 2,
                            },
                            nullable: true,
                            metadata: {},
                        },
                        {
                            name: 'ts',
                            type: {
                                typeId: 8,
                                unit: 0,
                            },
                            nullable: true,
                            metadata: {},
                        },
                        {
                            name: 'username',
                            type: {
                                typeId: 5,
                            },
                            nullable: true,
                            metadata: {},
                        },
                    ],
                },
                children: [
                    {
                        type: {
                            typeId: 3,
                            precision: 2,
                        },
                        children: [],
                        offset: 0,
                        length: 4,
                        _nullCount: 0,
                        stride: 1,
                        values: {
                            '0': 148235,
                            '1': 5450,
                            '2': 212080,
                            '3': 5450,
                        },
                        nullBitmap: {},
                    },
                    {
                        type: {
                            typeId: 8,
                            unit: 0,
                        },
                        children: [],
                        offset: 0,
                        length: 4,
                        _nullCount: 0,
                        stride: 1,
                        values: {
                            '0': 18597,
                            '1': 18597,
                            '2': 19527,
                            '3': 19890,
                        },
                        nullBitmap: {},
                    },
                    {
                        type: {
                            typeId: 5,
                        },
                        children: [],
                        offset: 0,
                        length: 4,
                        _nullCount: 0,
                        stride: 1,
                        valueOffsets: {
                            '0': 0,
                            '1': 10,
                            '2': 20,
                            '3': 29,
                            '4': 39,
                        },
                        values: {
                            '0': 49,
                            '1': 49,
                            '2': 51,
                            '3': 48,
                            '4': 50,
                            '5': 50,
                            '6': 50,
                            '7': 49,
                            '8': 50,
                            '9': 49,
                            '10': 49,
                            '11': 49,
                            '12': 51,
                            '13': 48,
                            '14': 50,
                            '15': 50,
                            '16': 50,
                            '17': 49,
                            '18': 50,
                            '19': 49,
                            '20': 97,
                            '21': 110,
                            '22': 111,
                            '23': 110,
                            '24': 121,
                            '25': 109,
                            '26': 111,
                            '27': 117,
                            '28': 115,
                            '29': 49,
                            '30': 49,
                            '31': 51,
                            '32': 48,
                            '33': 50,
                            '34': 50,
                            '35': 50,
                            '36': 49,
                            '37': 50,
                            '38': 49,
                        },
                        nullBitmap: {},
                    },
                ],
                offset: 0,
                length: 4,
                _nullCount: 0,
                stride: 1,
                nullBitmap: {},
            },
        },
    ],
    _offsets: {
        '0': 0,
        '1': 4,
    },
}

it('should render', () => {
    vi.spyOn(DB, 'queryDB').mockResolvedValue(
        queryResult as unknown as Awaited<ReturnType<typeof DB.queryDB>>
    )

    render(<ChartWrapper />)
})
