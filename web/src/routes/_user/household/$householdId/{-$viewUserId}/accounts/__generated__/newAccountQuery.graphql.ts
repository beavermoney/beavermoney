/**
 * @generated SignedSource<<5c1a928dac48736b16b8fc573a74123d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newAccountQuery$variables = Record<PropertyKey, never>;
export type newAccountQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newAccountFragment">;
};
export type newAccountQuery = {
  response: newAccountQuery$data;
  variables: newAccountQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "newAccountQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "newAccountFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "newAccountQuery",
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
    "cacheID": "b5b669cd092a4ea4b626ec8451227c4c",
    "id": null,
    "metadata": {},
    "name": "newAccountQuery",
    "operationKind": "query",
    "text": "query newAccountQuery {\n  ...newAccountFragment\n}\n\nfragment newAccountFragment on Query {\n  currencies {\n    id\n    code\n  }\n}\n"
  }
};

(node as any).hash = "61249ef108899fcc94a14af055f728e4";

export default node;
