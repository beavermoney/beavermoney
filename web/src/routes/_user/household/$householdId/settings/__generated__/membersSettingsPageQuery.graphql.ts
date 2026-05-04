/**
 * @generated SignedSource<<5c1e2391b3f216b54f4c0300a295c2e6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type membersSettingsPageQuery$variables = Record<PropertyKey, never>;
export type membersSettingsPageQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"membersSettingsFragment">;
  };
};
export type membersSettingsPageQuery = {
  response: membersSettingsPageQuery$data;
  variables: membersSettingsPageQuery$variables;
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
  "name": "code",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "membersSettingsPageQuery",
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
            "name": "membersSettingsFragment"
          }
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
    "name": "membersSettingsPageQuery",
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
            "concreteType": "UserHousehold",
            "kind": "LinkedField",
            "name": "userHouseholds",
            "plural": true,
            "selections": [
              (v0/*: any*/),
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
                "concreteType": "HouseholdCurrency",
                "kind": "LinkedField",
                "name": "householdCurrency",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v0/*: any*/)
                ],
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
                    "name": "email",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isSynthetic",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "HouseholdCurrency",
            "kind": "LinkedField",
            "name": "householdCurrencies",
            "plural": true,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3cd97e5aa84bcd49752c2f5f3b8718a8",
    "id": null,
    "metadata": {},
    "name": "membersSettingsPageQuery",
    "operationKind": "query",
    "text": "query membersSettingsPageQuery {\n  household {\n    ...membersSettingsFragment\n    id\n  }\n}\n\nfragment addMemberDialogFragment on Household {\n  id\n  userHouseholds {\n    id\n    user {\n      id\n    }\n  }\n  householdCurrencies {\n    id\n    code\n  }\n}\n\nfragment membersSettingsFragment on Household {\n  id\n  userHouseholds {\n    id\n    role\n    householdCurrency {\n      code\n      id\n    }\n    user {\n      id\n      name\n      email\n      isSynthetic\n    }\n  }\n  ...addMemberDialogFragment\n}\n"
  }
};
})();

(node as any).hash = "d8bb764ae399dd89330784d054fa41e8";

export default node;
