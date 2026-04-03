/**
 * @generated SignedSource<<e6a3d8445d761f387d6ef06dd59770f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type routeHouseholdQuery$variables = Record<PropertyKey, never>;
export type routeHouseholdQuery$data = {
  readonly households: ReadonlyArray<{
    readonly id: string;
  }>;
};
export type routeHouseholdQuery = {
  response: routeHouseholdQuery$data;
  variables: routeHouseholdQuery$variables;
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
    "name": "routeHouseholdQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "routeHouseholdQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "0cb6dfb79b0f30bad0f63e9696224d11",
    "id": null,
    "metadata": {},
    "name": "routeHouseholdQuery",
    "operationKind": "query",
    "text": "query routeHouseholdQuery {\n  households {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "23565c4085b82f38cc19b5abe3f5d355";

export default node;
