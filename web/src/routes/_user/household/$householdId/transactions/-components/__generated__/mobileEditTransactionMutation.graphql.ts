/**
 * @generated SignedSource<<bb97e1ac80dffcad7e62f006fa60fdf5>>
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
  clearMerchant?: boolean | null | undefined;
  datetime?: any | null | undefined;
  description?: string | null | undefined;
  excludeFromReports?: boolean | null | undefined;
  merchantID?: string | null | undefined;
  pending?: boolean | null | undefined;
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
  merchantName?: string | null | undefined;
};
export type mobileEditTransactionMutation$data = {
  readonly entry0?: {
    readonly node: {
      readonly account: {
        readonly balance: string;
        readonly id: string;
        readonly user: {
          readonly name: string;
        };
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
        readonly user: {
          readonly name: string;
        };
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
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "merchantName"
},
v15 = [
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
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "accountID",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "balance",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v22 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "TransactionEntry",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Account",
        "kind": "LinkedField",
        "name": "account",
        "plural": false,
        "selections": [
          (v16/*: any*/),
          (v19/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v20/*: any*/)
            ],
            "storageKey": null
          },
          (v21/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v23 = [
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
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "price",
  "storageKey": null
},
v25 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "InvestmentLot",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v16/*: any*/),
      (v17/*: any*/),
      (v24/*: any*/),
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
          (v16/*: any*/),
          (v17/*: any*/),
          (v21/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Account",
            "kind": "LinkedField",
            "name": "account",
            "plural": false,
            "selections": [
              (v16/*: any*/),
              (v21/*: any*/)
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
v26 = {
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
      "selections": (v25/*: any*/),
      "storageKey": null
    }
  ]
},
v27 = {
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
      "selections": (v25/*: any*/),
      "storageKey": null
    }
  ]
},
v28 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  },
  {
    "kind": "Variable",
    "name": "merchantName",
    "variableName": "merchantName"
  }
],
v29 = [
  (v20/*: any*/),
  (v16/*: any*/)
],
v30 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": (v29/*: any*/),
  "storageKey": null
},
v31 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "TransactionEntry",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Account",
        "kind": "LinkedField",
        "name": "account",
        "plural": false,
        "selections": [
          (v16/*: any*/),
          (v19/*: any*/),
          (v30/*: any*/),
          (v21/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "datetime",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "excludeFromReports",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pending",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v37 = {
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
    (v16/*: any*/)
  ],
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "concreteType": "Account",
  "kind": "LinkedField",
  "name": "account",
  "plural": false,
  "selections": [
    (v16/*: any*/),
    (v20/*: any*/),
    (v32/*: any*/),
    (v36/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "archived",
      "storageKey": null
    },
    (v19/*: any*/),
    (v30/*: any*/),
    (v37/*: any*/)
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
      (v13/*: any*/),
      (v14/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "mobileEditTransactionMutation",
    "selections": [
      {
        "condition": "editEntry0",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "entry0",
            "args": (v15/*: any*/),
            "concreteType": "TransactionEntryEdge",
            "kind": "LinkedField",
            "name": "updateTransactionEntry",
            "plural": false,
            "selections": (v22/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "editEntry1",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "entry1",
            "args": (v23/*: any*/),
            "concreteType": "TransactionEntryEdge",
            "kind": "LinkedField",
            "name": "updateTransactionEntry",
            "plural": false,
            "selections": (v22/*: any*/),
            "storageKey": null
          }
        ]
      },
      (v26/*: any*/),
      (v27/*: any*/),
      {
        "alias": null,
        "args": (v28/*: any*/),
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
              (v16/*: any*/),
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
      (v14/*: any*/),
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
      {
        "condition": "editEntry0",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "entry0",
            "args": (v15/*: any*/),
            "concreteType": "TransactionEntryEdge",
            "kind": "LinkedField",
            "name": "updateTransactionEntry",
            "plural": false,
            "selections": (v31/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "editEntry1",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "entry1",
            "args": (v23/*: any*/),
            "concreteType": "TransactionEntryEdge",
            "kind": "LinkedField",
            "name": "updateTransactionEntry",
            "plural": false,
            "selections": (v31/*: any*/),
            "storageKey": null
          }
        ]
      },
      (v26/*: any*/),
      (v27/*: any*/),
      {
        "alias": null,
        "args": (v28/*: any*/),
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
              (v16/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Merchant",
                "kind": "LinkedField",
                "name": "merchant",
                "plural": false,
                "selections": [
                  (v16/*: any*/),
                  (v20/*: any*/),
                  (v32/*: any*/)
                ],
                "storageKey": null
              },
              (v33/*: any*/),
              (v34/*: any*/),
              (v35/*: any*/),
              (v30/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionCategory",
                "kind": "LinkedField",
                "name": "category",
                "plural": false,
                "selections": [
                  (v16/*: any*/),
                  (v20/*: any*/),
                  (v36/*: any*/),
                  (v32/*: any*/)
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
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v38/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Transaction",
                    "kind": "LinkedField",
                    "name": "transaction",
                    "plural": false,
                    "selections": [
                      (v16/*: any*/),
                      (v35/*: any*/),
                      (v34/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": [
                          (v20/*: any*/),
                          (v36/*: any*/),
                          (v32/*: any*/),
                          (v16/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v33/*: any*/)
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
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v24/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Investment",
                    "kind": "LinkedField",
                    "name": "investment",
                    "plural": false,
                    "selections": [
                      (v16/*: any*/),
                      (v20/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "symbol",
                        "storageKey": null
                      },
                      (v36/*: any*/),
                      (v38/*: any*/),
                      (v37/*: any*/)
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
                      (v16/*: any*/),
                      (v35/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": (v29/*: any*/),
                        "storageKey": null
                      },
                      (v33/*: any*/)
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
    "cacheID": "b3b5e77e0c27faae5b562c5728caa0fc",
    "id": null,
    "metadata": {},
    "name": "mobileEditTransactionMutation",
    "operationKind": "mutation",
    "text": "mutation mobileEditTransactionMutation(\n  $id: ID!\n  $input: UpdateTransactionInput!\n  $merchantName: String\n  $entry0: ID!\n  $entry0Input: UpdateTransactionEntryInput!\n  $editEntry0: Boolean!\n  $entry1: ID!\n  $entry1Input: UpdateTransactionEntryInput!\n  $editEntry1: Boolean!\n  $lot0: ID!\n  $lot0Input: UpdateInvestmentLotInput!\n  $editLot0: Boolean!\n  $lot1: ID!\n  $lot1Input: UpdateInvestmentLotInput!\n  $editLot1: Boolean!\n) {\n  entry0: updateTransactionEntry(id: $entry0, input: $entry0Input) @include(if: $editEntry0) {\n    node {\n      id\n      amount\n      accountID\n      account {\n        id\n        balance\n        user {\n          name\n          id\n        }\n        value\n      }\n    }\n  }\n  entry1: updateTransactionEntry(id: $entry1, input: $entry1Input) @include(if: $editEntry1) {\n    node {\n      id\n      amount\n      accountID\n      account {\n        id\n        balance\n        user {\n          name\n          id\n        }\n        value\n      }\n    }\n  }\n  lot0: updateInvestmentLot(id: $lot0, input: $lot0Input) @include(if: $editLot0) {\n    node {\n      id\n      amount\n      price\n      investmentID\n      investment {\n        id\n        amount\n        value\n        account {\n          id\n          value\n        }\n      }\n    }\n  }\n  lot1: updateInvestmentLot(id: $lot1, input: $lot1Input) @include(if: $editLot1) {\n    node {\n      id\n      amount\n      price\n      investmentID\n      investment {\n        id\n        amount\n        value\n        account {\n          id\n          value\n        }\n      }\n    }\n  }\n  updateTransaction(id: $id, input: $input, merchantName: $merchantName) {\n    node {\n      id\n      ...mobileEditTransactionFragment\n      ...transactionCardFragment\n      ...editTransactionDialogTransactionFragment\n    }\n  }\n}\n\nfragment editTransactionDialogTransactionFragment on Transaction {\n  ...mobileEditTransactionFragment\n  merchant {\n    id\n    name\n    icon\n  }\n  id\n  description\n  datetime\n  categoryID\n  excludeFromReports\n  pending\n  category {\n    id\n    name\n    type\n  }\n  investmentLots {\n    ...investmentLotCardFragment\n    id\n    amount\n    price\n    investment {\n      id\n      account {\n        id\n      }\n    }\n  }\n  transactionEntries {\n    ...transactionEntryCardFragment\n    id\n    amount\n    account {\n      id\n    }\n  }\n}\n\nfragment investmentLotCardFragment on InvestmentLot {\n  id\n  amount\n  price\n  investment {\n    name\n    symbol\n    householdCurrency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    pending\n    category {\n      name\n      id\n    }\n    datetime\n  }\n}\n\nfragment mobileEditTransactionFragment on Transaction {\n  id\n  description\n  merchant {\n    id\n    name\n    icon\n  }\n  datetime\n  excludeFromReports\n  pending\n  user {\n    name\n    id\n  }\n  category {\n    id\n    name\n    type\n    icon\n  }\n  transactionEntries {\n    id\n    amount\n    account {\n      id\n      name\n      icon\n      type\n      archived\n      balance\n      user {\n        name\n        id\n      }\n      householdCurrency {\n        code\n        id\n      }\n    }\n  }\n  investmentLots {\n    id\n    amount\n    price\n    investment {\n      id\n      name\n      symbol\n      type\n      account {\n        id\n        name\n        icon\n        type\n        archived\n        balance\n        user {\n          name\n          id\n        }\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment transactionCardFragment on Transaction {\n  id\n  excludeFromReports\n  pending\n  merchant {\n    id\n    name\n    icon\n  }\n  transactionEntries {\n    id\n    amount\n    account {\n      name\n      householdCurrency {\n        code\n        id\n      }\n      id\n    }\n  }\n  investmentLots {\n    id\n    amount\n    price\n    investment {\n      name\n      symbol\n      type\n      account {\n        name\n        id\n      }\n      householdCurrency {\n        code\n        id\n      }\n      id\n    }\n  }\n  category {\n    name\n    type\n    icon\n    id\n  }\n}\n\nfragment transactionEntryCardFragment on TransactionEntry {\n  id\n  amount\n  account {\n    name\n    householdCurrency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    pending\n    excludeFromReports\n    category {\n      name\n      type\n      icon\n      id\n    }\n    datetime\n  }\n}\n"
  }
};
})();

(node as any).hash = "41f01b6bfc42440debe1dbca39b15077";

export default node;
