/**
 * @generated SignedSource<<8fd5a37c377ced8891ad3b5c0e74efbb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AccountCategory = "fhsa" | "hsa" | "ira_roth" | "ira_traditional" | "lira" | "plan_401k" | "plan_403b" | "plan_457b" | "plan_529" | "rdsp" | "resp" | "roth_401k" | "rrif" | "rrsp" | "sep_ira" | "simple_ira" | "tfsa" | "%future added value";
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type accountsPanelFragment$data = {
  readonly accounts: {
    readonly __id: string;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: AccountCategory | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly type: AccountType;
        readonly valueInDisplayCurrency: string | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"accountCardFragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly id: string;
  readonly " $fragmentType": "accountsPanelFragment";
};
export type accountsPanelFragment$key = {
  readonly " $data"?: accountsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"accountsPanelFragment">;
};

import accountsPanelRefetch_graphql from './accountsPanelRefetch.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "accounts"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": 50,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": accountsPanelRefetch_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "accountsPanelFragment",
  "selections": [
    {
      "alias": "accounts",
      "args": [
        {
          "kind": "Literal",
          "name": "where",
          "value": {
            "archived": false
          }
        }
      ],
      "concreteType": "AccountConnection",
      "kind": "LinkedField",
      "name": "__accountsPanel_accounts_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "AccountEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Account",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "type",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "category",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "valueInDisplayCurrency",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "accountCardFragment"
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
        },
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__id",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": "__accountsPanel_accounts_connection(where:{\"archived\":false})"
    },
    (v1/*: any*/)
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "19bb4c85689e84639f442cef13e43c8b";

export default node;
