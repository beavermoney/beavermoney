/**
 * @generated SignedSource<<aa489aeeaae9a90434004cad7a8cbd6b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type netWorthChartFragment$data = {
  readonly checkpoints: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly createTime: any;
        readonly investment: string;
        readonly liability: string;
        readonly liquidity: string;
        readonly netWorth: string;
        readonly property: string;
        readonly receivable: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "netWorthChartFragment";
};
export type netWorthChartFragment$key = {
  readonly " $data"?: netWorthChartFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"netWorthChartFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "forward",
        "path": [
          "checkpoints"
        ]
      }
    ]
  },
  "name": "netWorthChartFragment",
  "selections": [
    {
      "alias": "checkpoints",
      "args": [
        {
          "kind": "Literal",
          "name": "where",
          "value": {
            "createTimeGTE": "2020-01-01T00:00:00Z"
          }
        }
      ],
      "concreteType": "CheckpointConnection",
      "kind": "LinkedField",
      "name": "__netWorthChart_checkpoints_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "CheckpointEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Checkpoint",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "createTime",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "netWorth",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "liquidity",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "investment",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "property",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "receivable",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "liability",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "__netWorthChart_checkpoints_connection(where:{\"createTimeGTE\":\"2020-01-01T00:00:00Z\"})"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "b61565e37e99ff3868436e78545d7d33";

export default node;
