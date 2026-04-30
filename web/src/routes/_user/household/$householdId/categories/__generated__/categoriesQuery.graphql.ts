/**
 * @generated SignedSource<<2a518de5dc4f1b21dedc7a7d065cfad0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type categoriesQuery$variables = {
  endDate: any;
  startDate: any;
  viewUserId?: string | null | undefined;
};
export type categoriesQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"categoriesPanelFragment">;
  };
};
export type categoriesQuery = {
  response: categoriesQuery$data;
  variables: categoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endDate"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startDate"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "viewUserId"
},
v3 = {
  "kind": "Variable",
  "name": "endDate",
  "variableName": "endDate"
},
v4 = {
  "kind": "Variable",
  "name": "startDate",
  "variableName": "startDate"
},
v5 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
  "name": "icon",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "transactionCount",
  "storageKey": null
},
v11 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "categoryType",
    "storageKey": null
  },
  (v9/*: any*/),
  (v10/*: any*/),
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
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/)
        ],
        "storageKey": null
      },
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "categoriesQuery",
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
            "args": [
              (v3/*: any*/),
              (v4/*: any*/),
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
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "categoriesQuery",
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
            "args": (v5/*: any*/),
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
                      (v6/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
                        "storageKey": null
                      },
                      (v7/*: any*/),
                      (v8/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
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
            "storageKey": "transactionCategories(first:50)"
          },
          {
            "alias": null,
            "args": (v5/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/)
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
                "selections": (v11/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CategoryTypeAggregate",
                "kind": "LinkedField",
                "name": "expensesBreakdown",
                "plural": false,
                "selections": (v11/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7949c22adf23aacc2025ed659fa1bff5",
    "id": null,
    "metadata": {},
    "name": "categoriesQuery",
    "operationKind": "query",
    "text": "query categoriesQuery(\n  $startDate: Time!\n  $endDate: Time!\n  $viewUserId: ID\n) {\n  household {\n    ...categoriesPanelFragment_4baCpB\n    id\n  }\n}\n\nfragment categoriesPanelFragment_4baCpB on Household {\n  transactionCategories(first: 50) {\n    edges {\n      node {\n        id\n        type\n        ...categoryCardCategoryFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  financialReport(period: {startDate: $startDate, endDate: $endDate}, viewUserID: $viewUserId) {\n    incomeBreakdown {\n      categoryType\n      total\n      transactionCount\n    }\n    expensesBreakdown {\n      categoryType\n      total\n      transactionCount\n    }\n    ...categoryCardFinancialReportFragment\n    ...financialSummaryCardsFragment\n    ...categoriesSankeyFragment\n  }\n  id\n}\n\nfragment categoriesSankeyFragment on FinancialReport {\n  incomeBreakdown {\n    total\n    categories {\n      category {\n        id\n        name\n        icon\n      }\n      total\n    }\n  }\n  expensesBreakdown {\n    total\n    categories {\n      category {\n        id\n        name\n        icon\n      }\n      total\n    }\n  }\n}\n\nfragment categoryCardCategoryFragment on TransactionCategory {\n  id\n  name\n  type\n  icon\n}\n\nfragment categoryCardFinancialReportFragment on FinancialReport {\n  incomeBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n  expensesBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n}\n\nfragment financialSummaryCardsFragment on FinancialReport {\n  incomeBreakdown {\n    total\n  }\n  expensesBreakdown {\n    total\n  }\n}\n"
  }
};
})();

(node as any).hash = "2670dfdfa2df645606e4b1b89a5d7047";

export default node;
