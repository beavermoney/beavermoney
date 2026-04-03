/**
 * @generated SignedSource<<1662295fdae4992dd1a78659d32f3a3d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type HouseholdQuery$variables = Record<PropertyKey, never>;
export type HouseholdQuery$data = {
  readonly households: ReadonlyArray<{
    readonly id: string;
  }>;
};
export type HouseholdQuery = {
  response: HouseholdQuery$data;
  variables: HouseholdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Household",
    "kind": "LinkedField",
    "name": "households",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "HouseholdQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "HouseholdQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "0e0bedf5e32482f979e35b881b0124cb",
    "id": null,
    "metadata": {},
    "name": "HouseholdQuery",
    "operationKind": "query",
    "text": "query HouseholdQuery {\n  households {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d97256ba59d3821de740658cbcd100c";

export default node;
