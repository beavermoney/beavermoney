/**
 * @generated SignedSource<<0e811ead02c4bd0845f27b9943448b47>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserHouseholdRole = "admin" | "member" | "%future added value";
export type generalSettingsQuery$variables = Record<PropertyKey, never>;
export type generalSettingsQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"generalSettingsHouseholdFragment">;
  };
  readonly user: {
    readonly id: string;
  };
  readonly userHouseholds: ReadonlyArray<{
    readonly role: UserHouseholdRole;
    readonly user: {
      readonly id: string;
    };
  }>;
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
v1 = {
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v3 = [
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
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserHousehold",
        "kind": "LinkedField",
        "name": "userHouseholds",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
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
            "selections": (v3/*: any*/),
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
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserHousehold",
        "kind": "LinkedField",
        "name": "userHouseholds",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v1/*: any*/),
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ef0959eb42960b65629ae9d47fb6836c",
    "id": null,
    "metadata": {},
    "name": "generalSettingsQuery",
    "operationKind": "query",
    "text": "query generalSettingsQuery {\n  household {\n    ...generalSettingsHouseholdFragment\n    id\n  }\n  ...generalSettingsCurrenciesFragment\n  user {\n    id\n  }\n  userHouseholds {\n    role\n    user {\n      id\n    }\n    id\n  }\n}\n\nfragment generalSettingsCurrenciesFragment on Query {\n  currencies {\n    id\n    code\n  }\n}\n\nfragment generalSettingsHouseholdFragment on Household {\n  id\n  name\n  locale\n  currency {\n    id\n    code\n  }\n}\n"
  }
};
})();

(node as any).hash = "da4d7c7fdd19f90612156ca1d8e8e6e6";

export default node;
