/**
 * @generated SignedSource<<3de2998abbcbe7271026eda4fa06f668>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type categoriesPanelRefetch$variables = {
  count?: number | null | undefined;
  cursor?: any | null | undefined;
  endDate: any;
  id: string;
  startDate: any;
  viewUserId?: string | null | undefined;
};
export type categoriesPanelRefetch$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"categoriesPanelFragment">;
  } | null | undefined;
};
export type categoriesPanelRefetch = {
  response: categoriesPanelRefetch$data;
  variables: categoriesPanelRefetch$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": 50,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cursor"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endDate"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startDate"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "viewUserId"
},
v6 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v7 = {
  "kind": "Variable",
  "name": "endDate",
  "variableName": "endDate"
},
v8 = {
  "kind": "Variable",
  "name": "startDate",
  "variableName": "startDate"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "transactionCount",
  "storageKey": null
},
v16 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "categoryType",
    "storageKey": null
  },
  (v14/*: any*/),
  (v15/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "CategoryAggregate",
    "kind": "LinkedField",
    "name": "categories",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionCategory",
        "kind": "LinkedField",
        "name": "category",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "storageKey": null
      },
      (v14/*: any*/),
      (v15/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "categoriesPanelRefetch",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "count",
                "variableName": "count"
              },
              {
                "kind": "Variable",
                "name": "cursor",
                "variableName": "cursor"
              },
              (v7/*: any*/),
              (v8/*: any*/),
              {
                "kind": "Variable",
                "name": "viewUserId",
                "variableName": "viewUserId"
              }
            ],
            "kind": "FragmentSpread",
            "name": "categoriesPanelFragment"
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "categoriesPanelRefetch",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v11/*: any*/),
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
                        "selections": [
                          (v10/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "type",
                            "storageKey": null
                          },
                          (v12/*: any*/),
                          (v13/*: any*/),
                          (v9/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endCursor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasNextPage",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "kind": "ClientExtension",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__id",
                        "storageKey": null
                      }
                    ]
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v11/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "categoriesPanel_transactionCategories",
                "kind": "LinkedHandle",
                "name": "transactionCategories"
              },
              {
                "alias": null,
                "args": [
                  {
                    "fields": [
                      (v7/*: any*/),
                      (v8/*: any*/)
                    ],
                    "kind": "ObjectValue",
                    "name": "period"
                  },
                  {
                    "kind": "Variable",
                    "name": "viewUserID",
                    "variableName": "viewUserId"
                  }
                ],
                "concreteType": "FinancialReport",
                "kind": "LinkedField",
                "name": "financialReport",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CategoryTypeAggregate",
                    "kind": "LinkedField",
                    "name": "incomeBreakdown",
                    "plural": false,
                    "selections": (v16/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CategoryTypeAggregate",
                    "kind": "LinkedField",
                    "name": "expensesBreakdown",
                    "plural": false,
                    "selections": (v16/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Household",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4ccf83830c05919ae61416b727b2d466",
    "id": null,
    "metadata": {},
    "name": "categoriesPanelRefetch",
    "operationKind": "query",
    "text": "query categoriesPanelRefetch(\n  $count: Int = 50\n  $cursor: Cursor\n  $endDate: Time!\n  $startDate: Time!\n  $viewUserId: ID = null\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...categoriesPanelFragment_1IxM8H\n    id\n  }\n}\n\nfragment categoriesPanelFragment_1IxM8H on Household {\n  transactionCategories(first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        type\n        ...categoryCardCategoryFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  financialReport(period: {startDate: $startDate, endDate: $endDate}, viewUserID: $viewUserId) {\n    incomeBreakdown {\n      categoryType\n      total\n      transactionCount\n    }\n    expensesBreakdown {\n      categoryType\n      total\n      transactionCount\n    }\n    ...categoryCardFinancialReportFragment\n    ...financialSummaryCardsFragment\n    ...categoriesSankeyFragment\n  }\n  id\n}\n\nfragment categoriesSankeyFragment on FinancialReport {\n  incomeBreakdown {\n    total\n    categories {\n      category {\n        id\n        name\n        icon\n      }\n      total\n    }\n  }\n  expensesBreakdown {\n    total\n    categories {\n      category {\n        id\n        name\n        icon\n      }\n      total\n    }\n  }\n}\n\nfragment categoryCardCategoryFragment on TransactionCategory {\n  id\n  name\n  type\n  icon\n}\n\nfragment categoryCardFinancialReportFragment on FinancialReport {\n  incomeBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n  expensesBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n}\n\nfragment financialSummaryCardsFragment on FinancialReport {\n  incomeBreakdown {\n    total\n  }\n  expensesBreakdown {\n    total\n  }\n}\n"
  }
};
})();

(node as any).hash = "c759662296ed1a614608f82ce64691e7";

export default node;
