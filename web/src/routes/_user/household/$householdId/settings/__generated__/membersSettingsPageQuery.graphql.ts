/**
 * @generated SignedSource<<128e13a56f432150c064bd26880fccec>>
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
                  }
                ],
                "storageKey": null
              }
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
    "cacheID": "3fc05972f17f3a2c01e34293d24e6c32",
    "id": null,
    "metadata": {},
    "name": "membersSettingsPageQuery",
    "operationKind": "query",
    "text": "query membersSettingsPageQuery {\n  household {\n    ...membersSettingsFragment\n    id\n  }\n}\n\nfragment membersSettingsFragment on Household {\n  userHouseholds {\n    id\n    role\n    user {\n      id\n      name\n      email\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d8bb764ae399dd89330784d054fa41e8";

export default node;
