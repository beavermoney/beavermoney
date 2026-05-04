/**
 * @generated SignedSource<<366fff7a78d5640b6d8f66f82862c295>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newSubscriptionQuery$variables = Record<PropertyKey, never>;
export type newSubscriptionQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newSubscriptionFragment">;
};
export type newSubscriptionQuery = {
  response: newSubscriptionQuery$data;
  variables: newSubscriptionQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "newSubscriptionQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "newSubscriptionFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "newSubscriptionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Currency",
        "kind": "LinkedField",
        "name": "currencies",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "code",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ff8454458e361569e4147e950baf9e85",
    "id": null,
    "metadata": {},
    "name": "newSubscriptionQuery",
    "operationKind": "query",
    "text": "query newSubscriptionQuery {\n  ...newSubscriptionFragment\n}\n\nfragment newSubscriptionFragment on Query {\n  currencies {\n    id\n    code\n  }\n}\n"
  }
};

(node as any).hash = "f3f6d807bf78d6796a982b74360d5946";

export default node;
