/**
 * @generated SignedSource<<afbdec4952bf4def8b067073a0192842>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type subscriptionsPanelFragment$data = {
  readonly id: string;
  readonly recurringSubscriptions: {
    readonly __id: string;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly active: boolean;
        readonly cost: string;
        readonly householdCurrency: {
          readonly code: string;
        };
        readonly id: string;
        readonly interval: RecurringSubscriptionInterval;
        readonly intervalCount: number;
        readonly name: string;
        readonly startDate: any;
        readonly " $fragmentSpreads": FragmentRefs<"subscriptionCardFragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "subscriptionsPanelFragment";
};
export type subscriptionsPanelFragment$key = {
  readonly " $data"?: subscriptionsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"subscriptionsPanelFragment">;
};

import subscriptionsPanelRefetch_graphql from './subscriptionsPanelRefetch.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "recurringSubscriptions"
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
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "viewUserId"
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
      "operation": subscriptionsPanelRefetch_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "subscriptionsPanelFragment",
  "selections": [
    {
      "alias": "recurringSubscriptions",
      "args": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "userID",
              "variableName": "viewUserId"
            }
          ],
          "kind": "ObjectValue",
          "name": "where"
        }
      ],
      "concreteType": "RecurringSubscriptionConnection",
      "kind": "LinkedField",
      "name": "__subscriptionsPanel_recurringSubscriptions_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "RecurringSubscriptionEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "RecurringSubscription",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "active",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "cost",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "HouseholdCurrency",
                  "kind": "LinkedField",
                  "name": "householdCurrency",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "code",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "interval",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "intervalCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "startDate",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "subscriptionCardFragment"
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
      "storageKey": null
    },
    (v1/*: any*/)
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "73d0b8dd833db5e8d85d998db19f38e7";

export default node;
