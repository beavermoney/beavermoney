/**
 * @generated SignedSource<<2f44f849467b6c7f46c62cb46410e25f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserHouseholdRole = "admin" | "member" | "%future added value";
export type SettingsQuery$variables = Record<PropertyKey, never>;
export type SettingsQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"generalSettingsHouseholdFragment" | "membersSettingsFragment">;
  };
  readonly user: {
    readonly email: string;
    readonly id: string;
    readonly name: string;
  };
  readonly userHouseholds: ReadonlyArray<{
    readonly id: string;
    readonly role: UserHouseholdRole;
    readonly user: {
      readonly id: string;
    };
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"generalSettingsCurrenciesFragment">;
};
export type SettingsQuery = {
  response: SettingsQuery$data;
  variables: SettingsQuery$variables;
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
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "UserHousehold",
  "kind": "LinkedField",
  "name": "userHouseholds",
  "plural": true,
  "selections": [
    (v0/*: any*/),
    (v3/*: any*/),
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
    }
  ],
  "storageKey": null
},
v5 = [
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
    "name": "SettingsQuery",
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
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "membersSettingsFragment"
          }
        ],
        "storageKey": null
      },
      (v2/*: any*/),
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "generalSettingsCurrenciesFragment"
      },
      (v4/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsQuery",
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
          (v1/*: any*/),
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
            "selections": (v5/*: any*/),
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
              (v0/*: any*/),
              (v3/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Currency",
        "kind": "LinkedField",
        "name": "currencies",
        "plural": true,
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      (v4/*: any*/)
    ]
  },
  "params": {
    "cacheID": "77743dd409e1c2e26d20fd4d2eae916d",
    "id": null,
    "metadata": {},
    "name": "SettingsQuery",
    "operationKind": "query",
    "text": "query SettingsQuery {\n  household {\n    ...generalSettingsHouseholdFragment\n    ...membersSettingsFragment\n    id\n  }\n  user {\n    id\n    name\n    email\n  }\n  ...generalSettingsCurrenciesFragment\n  userHouseholds {\n    id\n    role\n    user {\n      id\n    }\n  }\n}\n\nfragment generalSettingsCurrenciesFragment on Query {\n  currencies {\n    id\n    code\n  }\n}\n\nfragment generalSettingsHouseholdFragment on Household {\n  id\n  name\n  locale\n  currency {\n    id\n    code\n  }\n}\n\nfragment membersSettingsFragment on Household {\n  userHouseholds {\n    id\n    role\n    user {\n      id\n      name\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b71ad7315c4015819998fbc28911b352";

export default node;
