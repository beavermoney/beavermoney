/**
 * @generated SignedSource<<bd36707b87152dd93bc9b8b028b5ab1d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AccountCategory = "fhsa" | "hsa" | "ira_roth" | "ira_traditional" | "lira" | "plan_401k" | "plan_403b" | "plan_457b" | "plan_529" | "rdsp" | "resp" | "roth_401k" | "rrif" | "rrsp" | "sep_ira" | "simple_ira" | "tfsa" | "%future added value";
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
export type CreateAccountInput = {
  balance?: string | null | undefined;
  category?: AccountCategory | null | undefined;
  currencyID: string;
  icon?: string | null | undefined;
  name: string;
  type: AccountType;
};
export type newAccountMutation$variables = {
  input: CreateAccountInput;
};
export type newAccountMutation$data = {
  readonly createAccount: {
    readonly node: {
      readonly id: string;
      readonly name: string;
      readonly type: AccountType;
      readonly " $fragmentSpreads": FragmentRefs<"accountCardFragment">;
    } | null | undefined;
  };
};
export type newAccountMutation = {
  response: newAccountMutation$data;
  variables: newAccountMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newAccountMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AccountEdge",
        "kind": "LinkedField",
        "name": "createAccount",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Account",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "accountCardFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newAccountMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AccountEdge",
        "kind": "LinkedField",
        "name": "createAccount",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Account",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "icon",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "updateTime",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "HouseholdCurrency",
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
                  (v2/*: any*/)
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
                  (v4/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
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
                "name": "balance",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a01ad2949e95b5269c61d945081be00c",
    "id": null,
    "metadata": {},
    "name": "newAccountMutation",
    "operationKind": "mutation",
    "text": "mutation newAccountMutation(\n  $input: CreateAccountInput!\n) {\n  createAccount(input: $input) {\n    node {\n      id\n      type\n      name\n      ...accountCardFragment\n    }\n  }\n}\n\nfragment accountCardFragment on Account {\n  id\n  name\n  type\n  icon\n  updateTime\n  currency {\n    code\n    id\n  }\n  user {\n    name\n    id\n  }\n  value\n  balance\n}\n"
  }
};
})();

(node as any).hash = "c874f628a451d5e9297d8123e0cbc391";

export default node;
