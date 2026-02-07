/**
 * @generated SignedSource<<5ff8a266b4fa764c35d61053ee8ec2cc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
export type editTransactionDialogQuery$variables = {
  transactionId: string;
};
export type editTransactionDialogQuery$data = {
  readonly node: {
    readonly __typename: "Transaction";
    readonly category: {
      readonly id: string;
      readonly name: string;
      readonly type: TransactionCategoryType;
    };
    readonly categoryID: string;
    readonly datetime: any;
    readonly description: string | null | undefined;
    readonly id: string;
    readonly investmentLots: ReadonlyArray<{
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"investmentLotCardFragment">;
    }> | null | undefined;
    readonly transactionEntries: ReadonlyArray<{
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"transactionEntryCardFragment">;
    }> | null | undefined;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly transactionCategories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly type: TransactionCategoryType;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
};
export type editTransactionDialogQuery = {
  response: editTransactionDialogQuery$data;
  variables: editTransactionDialogQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "transactionId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "transactionId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "datetime",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "categoryID",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v9 = [
  (v3/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/)
],
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "TransactionCategory",
  "kind": "LinkedField",
  "name": "category",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "TransactionCategoryConnection",
  "kind": "LinkedField",
  "name": "transactionCategories",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "TransactionCategoryEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TransactionCategory",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": (v9/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v13 = {
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
    (v3/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editTransactionDialogQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "InvestmentLot",
                "kind": "LinkedField",
                "name": "investmentLots",
                "plural": true,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "investmentLotCardFragment"
                  },
                  (v3/*: any*/)
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
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "transactionEntryCardFragment"
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Transaction",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      (v11/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editTransactionDialogQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "InvestmentLot",
                "kind": "LinkedField",
                "name": "investmentLots",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v12/*: any*/),
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
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "symbol",
                        "storageKey": null
                      },
                      (v13/*: any*/),
                      (v3/*: any*/)
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
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": [
                          (v7/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  }
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
                  (v3/*: any*/),
                  (v12/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Account",
                    "kind": "LinkedField",
                    "name": "account",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v13/*: any*/),
                      (v3/*: any*/)
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
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TransactionCategory",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": [
                          (v7/*: any*/),
                          (v8/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "icon",
                            "storageKey": null
                          },
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Transaction",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      (v11/*: any*/)
    ]
  },
  "params": {
    "cacheID": "e8ea837a119f78fafa1931951900d664",
    "id": null,
    "metadata": {},
    "name": "editTransactionDialogQuery",
    "operationKind": "query",
    "text": "query editTransactionDialogQuery(\n  $transactionId: ID!\n) {\n  node(id: $transactionId) {\n    __typename\n    ... on Transaction {\n      id\n      description\n      datetime\n      categoryID\n      category {\n        id\n        name\n        type\n      }\n      investmentLots {\n        ...investmentLotCardFragment\n        id\n      }\n      transactionEntries {\n        ...transactionEntryCardFragment\n        id\n      }\n    }\n    id\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment investmentLotCardFragment on InvestmentLot {\n  id\n  amount\n  price\n  investment {\n    name\n    symbol\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      id\n    }\n    datetime\n  }\n}\n\nfragment transactionEntryCardFragment on TransactionEntry {\n  id\n  amount\n  account {\n    name\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      type\n      icon\n      id\n    }\n    datetime\n  }\n}\n"
  }
};
})();

(node as any).hash = "394688238b8665799ea1aada870ad0f9";

export default node;
