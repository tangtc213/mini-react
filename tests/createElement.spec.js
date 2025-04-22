import {it , expect , describe} from 'vitest';
import React from '../core/React';

describe('createElement', () => {
    it('should return vdom for element', () => {
        const el = React.createElement('div', {id: 'id'}, 'hi-mini-react');

        // expect(el).toMatchInlineSnapshot(
        //     `
        //     {
        //       "props": {
        //       "children": [
        //       {
        //                     "children": [],
        //                     "nodeValue": "hi-mini-react",
        //                     "type": "TEXT_ELEMENT",
        //                 },
        //             ],
        //         },
        //         "type": "div",
        //     }
        // `
        // )
        expect(el).toEqual({
            type: 'div',
            props: {
                id: 'id',
                children: [
                    {
                        type: 'TEXT_ELEMENT',
                        props: {
                            nodeValue: 'hi-mini-react',
                            children: []
                        }
                    }
                ]
            }
        })
    })
    it('props is null', () => {
        const el = React.createElement('div', null, 'hi-mini-react');
        expect(el).toEqual({
            type: 'div',
            props: {
                children: [
                    {
                        type: 'TEXT_ELEMENT',
                        props: {
                            nodeValue: 'hi-mini-react',
                            children: []
                        }
                    }
                ]
            }
        })
    })
})

