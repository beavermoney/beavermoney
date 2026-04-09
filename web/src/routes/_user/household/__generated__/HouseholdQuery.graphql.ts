/**
 * @generated SignedSource<<e4fa640debbc0ec2f2f6337b75f141dc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type householdQuery$variables = Record<PropertyKey, never>;
export type householdQuery$data = {
  readonly households: ReadonlyArray<{
    readonly id: string;
  }>;
};
export type householdQuery = {
  response: householdQuery$data;
  variables: householdQuery$variables;
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
    "name": "householdQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "householdQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "97a77d4a4f9a23d305678039aae18845",
    "id": null,
    "metadata": {},
    "name": "householdQuery",
    "operationKind": "query",
    "text": "query householdQuery {\n  households {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "cd9cfe2b3f5f0ce3043497fa493d88b3";

export default node;
