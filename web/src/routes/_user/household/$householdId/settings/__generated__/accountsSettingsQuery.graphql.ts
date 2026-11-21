/**
 * @generated SignedSource<<e151355cc588fc4a87d29d18a63465e5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type accountsSettingsQuery$variables = Record<PropertyKey, never>;
export type accountsSettingsQuery$data = {
  readonly household: {
    readonly id: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"accountSettingsFragment">;
};
export type accountsSettingsQuery = {
  response: accountsSettingsQuery$data;
  variables: accountsSettingsQuery$variables;
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
  "concreteType": "Household",
  "kind": "LinkedField",
  "name": "household",
  "plural": false,
  "selections": [
    (v0/*: any*/)
  ],
  "storageKey": null
},
v2 = [
  {
    "kind": "Literal",
    "name": "where",
    "value": {
      "archived": true
    }
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "archived",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v0/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "accountsSettingsQuery",
    "selections": [
      (v1/*: any*/),
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "accountSettingsFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "accountsSettingsQuery",
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "InvestmentConnection",
        "kind": "LinkedField",
        "name": "investments",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "InvestmentEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Investment",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "symbol",
                    "storageKey": null
                  },
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Account",
                    "kind": "LinkedField",
                    "name": "account",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v6/*: any*/),
                      (v5/*: any*/),
                      (v7/*: any*/),
                      (v0/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "amount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "investments(where:{\"archived\":true})"
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "AccountConnection",
        "kind": "LinkedField",
        "name": "accounts",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AccountEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Account",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v3/*: any*/),
                  (v6/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "HouseholdCurrency",
                    "kind": "LinkedField",
                    "name": "householdCurrency",
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
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "accounts(where:{\"archived\":true})"
      }
    ]
  },
  "params": {
    "cacheID": "eff419274922ebc52d8822acdaf8de56",
    "id": null,
    "metadata": {},
    "name": "accountsSettingsQuery",
    "operationKind": "query",
    "text": "query accountsSettingsQuery {\n  household {\n    id\n  }\n  ...accountSettingsFragment\n}\n\nfragment accountSettingsFragment on Query {\n  investments(where: {archived: true}) {\n    edges {\n      node {\n        id\n        name\n        symbol\n        type\n        archived\n        account {\n          name\n          icon\n          archived\n          user {\n            name\n            id\n          }\n          id\n        }\n        ...investmentArchiveActionFragment\n      }\n    }\n  }\n  accounts(where: {archived: true}) {\n    edges {\n      node {\n        id\n        name\n        icon\n        type\n        archived\n        user {\n          name\n          id\n        }\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment investmentArchiveActionFragment on Investment {\n  id\n  archived\n  amount\n  account {\n    archived\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8857808cb637b364f0dff4acc45fdda1";

export default node;
