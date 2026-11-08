/**
 * @generated SignedSource<<c9888839781c8be04899a13a3fd2b2e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateTransactionInput = {
  categoryID?: string | null | undefined;
  clearDescription?: boolean | null | undefined;
  datetime?: any | null | undefined;
  description?: string | null | undefined;
  excludeFromReports?: boolean | null | undefined;
};
export type UpdateTransactionEntryInput = {
  accountID?: string | null | undefined;
  amount?: string | null | undefined;
};
export type UpdateInvestmentLotInput = {
  amount?: string | null | undefined;
  investmentID?: string | null | undefined;
  price?: string | null | undefined;
};
export type mobileEditTransactionMutation$variables = {
  editEntry0: boolean;
  editEntry1: boolean;
  editLot0: boolean;
  editLot1: boolean;
  entry0: string;
  entry0Input: UpdateTransactionEntryInput;
  entry1: string;
  entry1Input: UpdateTransactionEntryInput;
  id: string;
  input: UpdateTransactionInput;
  lot0: string;
  lot0Input: UpdateInvestmentLotInput;
  lot1: string;
  lot1Input: UpdateInvestmentLotInput;
};
export type mobileEditTransactionMutation$data = {
  readonly entry0?: {
    readonly node: {
      readonly account: {
        readonly balance: string;
        readonly id: string;
        readonly value: string;
      };
      readonly accountID: string;
      readonly amount: string;
      readonly id: string;
    } | null | undefined;
  };
  readonly entry1?: {
    readonly node: {
      readonly account: {
        readonly balance: string;
        readonly id: string;
        readonly value: string;
      };
      readonly accountID: string;
      readonly amount: string;
      readonly id: string;
    } | null | undefined;
  };
  readonly lot0?: {
    readonly node: {
      readonly amount: string;
      readonly id: string;
      readonly investment: {
        readonly account: {
          readonly id: string;
          readonly value: string;
        };
        readonly amount: string;
        readonly id: string;
        readonly value: string;
      };
      readonly investmentID: string;
      readonly price: string;
    } | null | undefined;
  };
  readonly lot1?: {
    readonly node: {
      readonly amount: string;
      readonly id: string;
      readonly investment: {
        readonly account: {
          readonly id: string;
          readonly value: string;
        };
        readonly amount: string;
        readonly id: string;
        readonly value: string;
      };
      readonly investmentID: string;
      readonly price: string;
    } | null | undefined;
  };
  readonly updateTransaction: {
    readonly node: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"editTransactionDialogTransactionFragment" | "mobileEditTransactionFragment" | "transactionCardFragment">;
    } | null | undefined;
  };
};
export type mobileEditTransactionMutation = {
  response: mobileEditTransactionMutation$data;
  variables: mobileEditTransactionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "editEntry0"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "editEntry1"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "editLot0"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "editLot1"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entry0"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entry0Input"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entry1"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entry1Input"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "lot0"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "lot0Input"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "lot1"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "lot1Input"
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v17 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "TransactionEntry",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v14/*: any*/),
      (v15/*: any*/),
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
        "concreteType": "Account",
        "kind": "LinkedField",
        "name": "account",
        "plural": false,
        "selections": [
          (v14/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "balance",
            "storageKey": null
          },
          (v16/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v18 = {
  "condition": "editEntry0",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "entry0",
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "entry0"
        },
        {
          "kind": "Variable",
          "name": "input",
          "variableName": "entry0Input"
        }
      ],
      "concreteType": "TransactionEntryEdge",
      "kind": "LinkedField",
      "name": "updateTransactionEntry",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    }
  ]
},
v19 = {
  "condition": "editEntry1",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "entry1",
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "entry1"
        },
        {
          "kind": "Variable",
          "name": "input",
          "variableName": "entry1Input"
        }
      ],
      "concreteType": "TransactionEntryEdge",
      "kind": "LinkedField",
      "name": "updateTransactionEntry",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    }
  ]
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "price",
  "storageKey": null
},
v21 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "InvestmentLot",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v14/*: any*/),
      (v15/*: any*/),
      (v20/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "investmentID",
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
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Account",
            "kind": "LinkedField",
            "name": "account",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              (v16/*: any*/)
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
v22 = {
  "condition": "editLot0",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "lot0",
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "lot0"
        },
        {
          "kind": "Variable",
          "name": "input",
          "variableName": "lot0Input"
        }
      ],
      "concreteType": "InvestmentLotEdge",
      "kind": "LinkedField",
      "name": "updateInvestmentLot",
      "plural": false,
      "selections": (v21/*: any*/),
      "storageKey": null
    }
  ]
},
v23 = {
  "condition": "editLot1",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "lot1",
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "lot1"
        },
        {
          "kind": "Variable",
          "name": "input",
          "variableName": "lot1Input"
        }
      ],
      "concreteType": "InvestmentLotEdge",
      "kind": "LinkedField",
      "name": "updateInvestmentLot",
      "plural": false,
      "selections": (v21/*: any*/),
      "storageKey": null
    }
  ]
},
v24 = [
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
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "datetime",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "excludeFromReports",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v28 = [
  (v27/*: any*/),
  (v14/*: any*/)
],
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v31 = {
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
    (v14/*: any*/)
  ],
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "concreteType": "Account",
  "kind": "LinkedField",
  "name": "account",
  "plural": false,
  "selections": [
    (v14/*: any*/),
    (v27/*: any*/),
    (v30/*: any*/),
    (v29/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "archived",
      "storageKey": null
    },
    (v31/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "mobileEditTransactionMutation",
    "selections": [
      (v18/*: any*/),
      (v19/*: any*/),
      (v22/*: any*/),
      (v23/*: any*/),
      {
        "alias": null,
        "args": (v24/*: any*/),
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
              (v14/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "mobileEditTransactionFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "transactionCardFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "editTransactionDialogTransactionFragment"
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
    "argumentDefinitions": [
      (v8/*: any*/),
      (v9/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v1/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v2/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "mobileEditTransactionMutation",
    "selections": [
      (v18/*: any*/),
      (v19/*: any*/),
      (v22/*: any*/),
      (v23/*: any*/),
      {
        "alias": null,
        "args": (v24/*: any*/),
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
              (v14/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              },
              (v25/*: any*/),
              (v26/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": (v28/*: any*/),
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
                  (v14/*: any*/),
                  (v27/*: any*/),
                  (v29/*: any*/),
                  (v30/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionEntry",
                "kind": "LinkedField",
                "name": "transactionEntries",
                "plural": true,
                "selections": [
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v32/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Transaction",
                    "kind": "LinkedField",
                    "name": "transaction",
                    "plural": false,
                    "selections": [
                      (v14/*: any*/),
                      (v26/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": [
                          (v27/*: any*/),
                          (v29/*: any*/),
                          (v30/*: any*/),
                          (v14/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v25/*: any*/)
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
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v20/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Investment",
                    "kind": "LinkedField",
                    "name": "investment",
                    "plural": false,
                    "selections": [
                      (v14/*: any*/),
                      (v27/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "symbol",
                        "storageKey": null
                      },
                      (v32/*: any*/),
                      (v31/*: any*/)
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
                      (v14/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": (v28/*: any*/),
                        "storageKey": null
                      },
                      (v25/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "categoryID",
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
    "cacheID": "46840184e0caa478982f5bced3248cfd",
    "id": null,
    "metadata": {},
    "name": "mobileEditTransactionMutation",
    "operationKind": "mutation",
    "text": "mutation mobileEditTransactionMutation(\n  $id: ID!\n  $input: UpdateTransactionInput!\n  $entry0: ID!\n  $entry0Input: UpdateTransactionEntryInput!\n  $editEntry0: Boolean!\n  $entry1: ID!\n  $entry1Input: UpdateTransactionEntryInput!\n  $editEntry1: Boolean!\n  $lot0: ID!\n  $lot0Input: UpdateInvestmentLotInput!\n  $editLot0: Boolean!\n  $lot1: ID!\n  $lot1Input: UpdateInvestmentLotInput!\n  $editLot1: Boolean!\n) {\n  entry0: updateTransactionEntry(id: $entry0, input: $entry0Input) @include(if: $editEntry0) {\n    node {\n      id\n      amount\n      accountID\n      account {\n        id\n        balance\n        value\n      }\n    }\n  }\n  entry1: updateTransactionEntry(id: $entry1, input: $entry1Input) @include(if: $editEntry1) {\n    node {\n      id\n      amount\n      accountID\n      account {\n        id\n        balance\n        value\n      }\n    }\n  }\n  lot0: updateInvestmentLot(id: $lot0, input: $lot0Input) @include(if: $editLot0) {\n    node {\n      id\n      amount\n      price\n      investmentID\n      investment {\n        id\n        amount\n        value\n        account {\n          id\n          value\n        }\n      }\n    }\n  }\n  lot1: updateInvestmentLot(id: $lot1, input: $lot1Input) @include(if: $editLot1) {\n    node {\n      id\n      amount\n      price\n      investmentID\n      investment {\n        id\n        amount\n        value\n        account {\n          id\n          value\n        }\n      }\n    }\n  }\n  updateTransaction(id: $id, input: $input) {\n    node {\n      id\n      ...mobileEditTransactionFragment\n      ...transactionCardFragment\n      ...editTransactionDialogTransactionFragment\n    }\n  }\n}\n\nfragment editTransactionDialogTransactionFragment on Transaction {\n  ...mobileEditTransactionFragment\n  id\n  description\n  datetime\n  categoryID\n  excludeFromReports\n  category {\n    id\n    name\n    type\n  }\n  investmentLots {\n    ...investmentLotCardFragment\n    id\n    amount\n    price\n    investment {\n      id\n      account {\n        id\n      }\n    }\n  }\n  transactionEntries {\n    ...transactionEntryCardFragment\n    id\n    amount\n    account {\n      id\n    }\n  }\n}\n\nfragment investmentLotCardFragment on InvestmentLot {\n  id\n  amount\n  price\n  investment {\n    name\n    symbol\n    householdCurrency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      id\n    }\n    datetime\n  }\n}\n\nfragment mobileEditTransactionFragment on Transaction {\n  id\n  description\n  datetime\n  excludeFromReports\n  user {\n    name\n    id\n  }\n  category {\n    id\n    name\n    type\n    icon\n  }\n  transactionEntries {\n    id\n    amount\n    account {\n      id\n      name\n      icon\n      type\n      archived\n      householdCurrency {\n        code\n        id\n      }\n    }\n  }\n  investmentLots {\n    id\n    amount\n    price\n    investment {\n      id\n      name\n      symbol\n      account {\n        id\n        name\n        icon\n        type\n        archived\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment transactionCardFragment on Transaction {\n  id\n  transactionEntries {\n    id\n    amount\n    ...transactionEntryCardFragment\n  }\n  investmentLots {\n    id\n    amount\n    ...investmentLotCardFragment\n  }\n  category {\n    name\n    id\n  }\n}\n\nfragment transactionEntryCardFragment on TransactionEntry {\n  id\n  amount\n  account {\n    name\n    householdCurrency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    excludeFromReports\n    category {\n      name\n      type\n      icon\n      id\n    }\n    datetime\n  }\n}\n"
  }
};
})();

(node as any).hash = "d943197ff74d39873972794e1de8b69b";

export default node;
