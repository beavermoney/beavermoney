/**
 * @generated SignedSource<<34417420120d3317eface597d6c4e5e3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubscriptionIdQuery$variables = {
  id: string;
};
export type SubscriptionIdQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"editSubscriptionFragment" | "subscriptionCardFragment">;
  } | null | undefined;
};
export type SubscriptionIdQuery = {
  response: SubscriptionIdQuery$data;
  variables: SubscriptionIdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SubscriptionIdQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "subscriptionCardFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "editSubscriptionFragment"
              }
            ],
            "type": "RecurringSubscription",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SubscriptionIdQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
                "name": "icon",
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
                "kind": "ScalarField",
                "name": "fxRate",
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
                "concreteType": "Currency",
                "kind": "LinkedField",
                "name": "currency",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "code",
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "active",
                "storageKey": null
              }
            ],
            "type": "RecurringSubscription",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "efe7cb0993d38654f98f86ad7e11468b",
    "id": null,
    "metadata": {},
    "name": "SubscriptionIdQuery",
    "operationKind": "query",
    "text": "query SubscriptionIdQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on RecurringSubscription {\n      ...subscriptionCardFragment\n      ...editSubscriptionFragment\n    }\n    id\n  }\n}\n\nfragment editSubscriptionFragment on RecurringSubscription {\n  id\n  name\n  icon\n  cost\n  interval\n  intervalCount\n  startDate\n  active\n  currency {\n    code\n    id\n  }\n}\n\nfragment subscriptionCardFragment on RecurringSubscription {\n  id\n  name\n  icon\n  cost\n  fxRate\n  interval\n  intervalCount\n  startDate\n  currency {\n    code\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "66f67b8560acccd64bfb5da9c9afbc6e";

export default node;
