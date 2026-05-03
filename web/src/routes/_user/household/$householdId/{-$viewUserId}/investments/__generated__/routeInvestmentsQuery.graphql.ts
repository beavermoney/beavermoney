/**
 * @generated SignedSource<<84538977d8f74d119350add88b773ef2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type routeInvestmentsQuery$variables = Record<PropertyKey, never>;
export type routeInvestmentsQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"investmentsPanelFragment">;
};
export type routeInvestmentsQuery = {
  response: routeInvestmentsQuery$data;
  variables: routeInvestmentsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
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
    (v0/*: any*/)
  ],
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "routeInvestmentsQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "investmentsPanelFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "routeInvestmentsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "households",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Investment",
        "kind": "LinkedField",
        "name": "investments",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "value",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "valueInHouseholdCurrency",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "amount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Account",
            "kind": "LinkedField",
            "name": "account",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v0/*: any*/)
            ],
            "storageKey": null
          },
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
            "name": "symbol",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updateTime",
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8bfcb0e732e2cde63fa3c1d25e7da54d",
    "id": null,
    "metadata": {},
    "name": "routeInvestmentsQuery",
    "operationKind": "query",
    "text": "query routeInvestmentsQuery {\n  ...investmentsPanelFragment\n}\n\nfragment investmentCardFragment on Investment {\n  id\n  name\n  type\n  symbol\n  updateTime\n  currency {\n    code\n    id\n  }\n  value\n}\n\nfragment investmentsPanelFragment on Query {\n  households {\n    id\n    currency {\n      code\n      id\n    }\n  }\n  investments {\n    id\n    name\n    value\n    valueInHouseholdCurrency\n    amount\n    account {\n      name\n      id\n    }\n    ...investmentCardFragment\n  }\n}\n"
  }
};
})();

(node as any).hash = "cc0a562d872c0da259757753f997184c";

export default node;
