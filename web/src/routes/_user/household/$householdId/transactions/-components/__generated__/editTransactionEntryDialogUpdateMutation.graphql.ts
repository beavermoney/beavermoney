/**
 * @generated SignedSource<<6c1b8ca0e27f8e83596ddb26e9e53ad8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateTransactionEntryInput = {
  accountID?: string | null | undefined;
  amount?: string | null | undefined;
};
export type editTransactionEntryDialogUpdateMutation$variables = {
  id: string;
  input: UpdateTransactionEntryInput;
};
export type editTransactionEntryDialogUpdateMutation$data = {
  readonly updateTransactionEntry: {
    readonly node: {
      readonly account: {
        readonly balance: string;
        readonly householdCurrency: {
          readonly code: string;
          readonly id: string;
        };
        readonly id: string;
        readonly value: string;
      };
      readonly accountID: string;
      readonly amount: string;
      readonly householdCurrencyID: string;
      readonly id: string;
    } | null | undefined;
  };
};
export type editTransactionEntryDialogUpdateMutation = {
  response: editTransactionEntryDialogUpdateMutation$data;
  variables: editTransactionEntryDialogUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "TransactionEntryEdge",
    "kind": "LinkedField",
    "name": "updateTransactionEntry",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionEntry",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
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
            "kind": "ScalarField",
            "name": "accountID",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "householdCurrencyID",
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
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "balance",
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
                "concreteType": "HouseholdCurrency",
                "kind": "LinkedField",
                "name": "householdCurrency",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "code",
                    "storageKey": null
                  }
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editTransactionEntryDialogUpdateMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editTransactionEntryDialogUpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "9dcdfc79655c0b1fec25e43410a361b7",
    "id": null,
    "metadata": {},
    "name": "editTransactionEntryDialogUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation editTransactionEntryDialogUpdateMutation(\n  $id: ID!\n  $input: UpdateTransactionEntryInput!\n) {\n  updateTransactionEntry(id: $id, input: $input) {\n    node {\n      id\n      amount\n      accountID\n      householdCurrencyID\n      account {\n        id\n        balance\n        value\n        householdCurrency {\n          id\n          code\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1e3e4c6e65a805262d90803adf7d53ca";

export default node;
