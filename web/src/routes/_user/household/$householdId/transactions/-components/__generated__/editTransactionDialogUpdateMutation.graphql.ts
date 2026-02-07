/**
 * @generated SignedSource<<d9c01232956190e61e6e2a68c7723654>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
export type UpdateTransactionInput = {
  categoryID?: string | null | undefined;
  clearDescription?: boolean | null | undefined;
  datetime?: any | null | undefined;
  description?: string | null | undefined;
};
export type editTransactionDialogUpdateMutation$variables = {
  id: string;
  input: UpdateTransactionInput;
};
export type editTransactionDialogUpdateMutation$data = {
  readonly updateTransaction: {
    readonly node: {
      readonly category: {
        readonly icon: string;
        readonly id: string;
        readonly name: string;
        readonly type: TransactionCategoryType;
      };
      readonly categoryID: string;
      readonly datetime: any;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"transactionCardFragment">;
    } | null | undefined;
  };
};
export type editTransactionDialogUpdateMutation = {
  response: editTransactionDialogUpdateMutation$data;
  variables: editTransactionDialogUpdateMutation$variables;
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
v1 = [
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
  "name": "description",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "datetime",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "categoryID",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "TransactionCategory",
  "kind": "LinkedField",
  "name": "category",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v6/*: any*/),
    (v7/*: any*/),
    (v8/*: any*/)
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v11 = {
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
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editTransactionDialogUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransactionEdge",
        "kind": "LinkedField",
        "name": "updateTransaction",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Transaction",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v9/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "transactionCardFragment"
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
    "name": "editTransactionDialogUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransactionEdge",
        "kind": "LinkedField",
        "name": "updateTransaction",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Transaction",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionEntry",
                "kind": "LinkedField",
                "name": "transactionEntries",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Account",
                    "kind": "LinkedField",
                    "name": "account",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v11/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Transaction",
                    "kind": "LinkedField",
                    "name": "transaction",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          (v7/*: any*/),
                          (v8/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "InvestmentLot",
                "kind": "LinkedField",
                "name": "investmentLots",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "price",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Investment",
                    "kind": "LinkedField",
                    "name": "investment",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "symbol",
                        "storageKey": null
                      },
                      (v11/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Transaction",
                    "kind": "LinkedField",
                    "name": "transaction",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v4/*: any*/)
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
    ]
  },
  "params": {
    "cacheID": "f14c07a4166fb4a2abb9871ae31ce11b",
    "id": null,
    "metadata": {},
    "name": "editTransactionDialogUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation editTransactionDialogUpdateMutation(\n  $id: ID!\n  $input: UpdateTransactionInput!\n) {\n  updateTransaction(id: $id, input: $input) {\n    node {\n      id\n      description\n      datetime\n      categoryID\n      category {\n        id\n        name\n        type\n        icon\n      }\n      ...transactionCardFragment\n    }\n  }\n}\n\nfragment investmentLotCardFragment on InvestmentLot {\n  id\n  amount\n  price\n  investment {\n    name\n    symbol\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      id\n    }\n    datetime\n  }\n}\n\nfragment transactionCardFragment on Transaction {\n  id\n  transactionEntries {\n    id\n    amount\n    ...transactionEntryCardFragment\n  }\n  investmentLots {\n    id\n    amount\n    ...investmentLotCardFragment\n  }\n  category {\n    name\n    id\n  }\n}\n\nfragment transactionEntryCardFragment on TransactionEntry {\n  id\n  amount\n  account {\n    name\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      type\n      icon\n      id\n    }\n    datetime\n  }\n}\n"
  }
};
})();

(node as any).hash = "b58b8c2b57d83947729498447610196a";

export default node;
