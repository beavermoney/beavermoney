/**
 * @generated SignedSource<<db16e542bd8e5eae463ba7a589f5283d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type generalSettingsQuery$variables = Record<PropertyKey, never>;
export type generalSettingsQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"generalSettingsHouseholdFragment">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"generalSettingsCurrenciesFragment">;
};
export type generalSettingsQuery = {
  response: generalSettingsQuery$data;
  variables: generalSettingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "code",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "generalSettingsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "generalSettingsHouseholdFragment"
          }
        ],
        "storageKey": null
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "generalSettingsCurrenciesFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "generalSettingsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
            "name": "locale",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Currency",
            "kind": "LinkedField",
            "name": "currency",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Currency",
        "kind": "LinkedField",
        "name": "currencies",
        "plural": true,
        "selections": (v1/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserHousehold",
        "kind": "LinkedField",
        "name": "userHouseholds",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "role",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0e266ef43cacb6a5e1a9a47862e7e551",
    "id": null,
    "metadata": {},
    "name": "generalSettingsQuery",
    "operationKind": "query",
    "text": "query generalSettingsQuery {\n  household {\n    ...generalSettingsHouseholdFragment\n    id\n  }\n  ...generalSettingsCurrenciesFragment\n}\n\nfragment generalSettingsCurrenciesFragment on Query {\n  currencies {\n    id\n    code\n  }\n  userHouseholds {\n    role\n    user {\n      id\n    }\n    id\n  }\n}\n\nfragment generalSettingsHouseholdFragment on Household {\n  id\n  name\n  locale\n  currency {\n    id\n    code\n  }\n}\n"
  }
};
})();

(node as any).hash = "bcd0e4c9359204f10d3b99c201cf5a6c";

export default node;
