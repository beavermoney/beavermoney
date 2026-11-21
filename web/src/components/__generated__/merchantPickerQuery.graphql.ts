/**
 * @generated SignedSource<<c69a020b68fd1ea23c85900fba78d6f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type merchantPickerQuery$variables = {
  query: string;
};
export type merchantPickerQuery$data = {
  readonly household: {
    readonly merchantSearch: ReadonlyArray<{
      readonly icon: string | null | undefined;
      readonly id: string;
      readonly name: string;
    }>;
  };
};
export type merchantPickerQuery = {
  response: merchantPickerQuery$data;
  variables: merchantPickerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "query"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "first",
      "value": 20
    },
    {
      "kind": "Variable",
      "name": "query",
      "variableName": "query"
    }
  ],
  "concreteType": "Merchant",
  "kind": "LinkedField",
  "name": "merchantSearch",
  "plural": true,
  "selections": [
    (v1/*: any*/),
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
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "merchantPickerQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "merchantPickerQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "143da7b51f21f3a1ab55a20fbcf029cf",
    "id": null,
    "metadata": {},
    "name": "merchantPickerQuery",
    "operationKind": "query",
    "text": "query merchantPickerQuery(\n  $query: String!\n) {\n  household {\n    merchantSearch(query: $query, first: 20) {\n      id\n      name\n      icon\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a3c51583a9925baff08ddd3b472bd906";

export default node;
