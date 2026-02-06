/**
 * @generated SignedSource<<51e3b9bab0960a23c4a933018fb46669>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SellInvestmentInputCustom = {
  fees?: ReadonlyArray<CreateTransactionEntryInput>;
  investmentLot: CreateInvestmentLotInput;
  transaction: CreateTransactionInput;
  transactionEntry: CreateTransactionEntryInput;
};
export type CreateTransactionInput = {
  categoryID: string;
  datetime: any;
  description?: string | null | undefined;
};
export type CreateTransactionEntryInput = {
  accountID: string;
  amount: string;
};
export type CreateInvestmentLotInput = {
  amount: string;
  investmentID: string;
  price: string;
};
export type newSellMutation$variables = {
  input: SellInvestmentInputCustom;
};
export type newSellMutation$data = {
  readonly sellInvestment: {
    readonly node: {
      readonly category: {
        readonly name: string;
      };
      readonly datetime: any;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"transactionCardFragment">;
    } | null | undefined;
  };
};
export type newSellMutation = {
  response: newSellMutation$data;
  variables: newSellMutation$variables;
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
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v7 = {
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
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newSellMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransactionEdge",
        "kind": "LinkedField",
        "name": "sellInvestment",
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
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "transactionCardFragment"
              },
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionCategory",
                "kind": "LinkedField",
                "name": "category",
                "plural": false,
                "selections": [
                  (v5/*: any*/)
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
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newSellMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransactionEdge",
        "kind": "LinkedField",
        "name": "sellInvestment",
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
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionEntry",
                "kind": "LinkedField",
                "name": "transactionEntries",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Account",
                    "kind": "LinkedField",
                    "name": "account",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v7/*: any*/),
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
                          (v5/*: any*/),
                          (v8/*: any*/),
                          (v9/*: any*/),
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
                  (v6/*: any*/),
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
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "symbol",
                        "storageKey": null
                      },
                      (v7/*: any*/),
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
                          (v5/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "categoryID",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionCategory",
                "kind": "LinkedField",
                "name": "category",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v5/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
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
    "cacheID": "8ae8416b151a4d8cef708deb4cc331df",
    "id": null,
    "metadata": {},
    "name": "newSellMutation",
    "operationKind": "mutation",
    "text": "mutation newSellMutation(\n  $input: SellInvestmentInputCustom!\n) {\n  sellInvestment(input: $input) {\n    node {\n      ...transactionCardFragment\n      id\n      description\n      datetime\n      category {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment editTransactionDialogFragment on Transaction {\n  id\n  description\n  datetime\n  categoryID\n  category {\n    id\n    name\n    type\n    icon\n  }\n  investmentLots {\n    ...investmentLotCardFragment\n    id\n    amount\n    price\n    investment {\n      name\n      symbol\n      currency {\n        code\n        id\n      }\n      id\n    }\n  }\n  transactionEntries {\n    ...transactionEntryCardFragment\n    id\n    amount\n    account {\n      name\n      currency {\n        code\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment investmentLotCardFragment on InvestmentLot {\n  id\n  amount\n  price\n  investment {\n    name\n    symbol\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      id\n    }\n    datetime\n  }\n}\n\nfragment transactionCardFragment on Transaction {\n  transactionEntries {\n    id\n    amount\n    ...transactionEntryCardFragment\n  }\n  investmentLots {\n    id\n    amount\n    ...investmentLotCardFragment\n  }\n  ...editTransactionDialogFragment\n  category {\n    name\n    id\n  }\n}\n\nfragment transactionEntryCardFragment on TransactionEntry {\n  id\n  amount\n  account {\n    name\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      type\n      icon\n      id\n    }\n    datetime\n  }\n}\n"
  }
};
})();

(node as any).hash = "35c9b68e14f27cd0e4e19d04412daab6";

export default node;
