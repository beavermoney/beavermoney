/**
 * @generated SignedSource<<8753f91f40b13367f3c5835d336e8bb7>>
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
  startDate: any;
};
export type categoriesPanelRefetch$data = {
  readonly " $fragmentSpreads": FragmentRefs<"categoriesPanelFragment">;
};
export type categoriesPanelRefetch = {
  response: categoriesPanelRefetch$data;
  variables: categoriesPanelRefetch$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": 50,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endDate"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "startDate"
  }
],
v1 = {
  "kind": "Variable",
  "name": "endDate",
  "variableName": "endDate"
},
v2 = {
  "kind": "Variable",
  "name": "startDate",
  "variableName": "startDate"
},
v3 = [
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "transactionCount",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "categoryType",
    "storageKey": null
  },
  (v5/*: any*/),
  (v6/*: any*/),
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
          (v4/*: any*/)
        ],
        "storageKey": null
      },
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "categoriesPanelRefetch",
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
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "categoriesPanelFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "categoriesPanelRefetch",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
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
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "categoriesPanel_transactionCategories",
        "kind": "LinkedHandle",
        "name": "transactionCategories"
      },
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
            "args": [
              {
                "fields": [
                  (v1/*: any*/),
                  (v2/*: any*/)
                ],
                "kind": "ObjectValue",
                "name": "period"
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
                "selections": (v7/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CategoryTypeAggregate",
                "kind": "LinkedField",
                "name": "expensesBreakdown",
                "plural": false,
                "selections": (v7/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "73c99d9c52745ea3d6047858a55cca34",
    "id": null,
    "metadata": {},
    "name": "categoriesPanelRefetch",
    "operationKind": "query",
    "text": "query categoriesPanelRefetch(\n  $count: Int = 50\n  $cursor: Cursor\n  $endDate: Time!\n  $startDate: Time!\n) {\n  ...categoriesPanelFragment_41eAbc\n}\n\nfragment categoriesPanelFragment_41eAbc on Query {\n  transactionCategories(first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        type\n        ...categoryCardCategoryFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  household {\n    financialReport(period: {startDate: $startDate, endDate: $endDate}) {\n      incomeBreakdown {\n        categoryType\n        total\n        transactionCount\n      }\n      expensesBreakdown {\n        categoryType\n        total\n        transactionCount\n      }\n      ...categoryCardFinancialReportFragment\n      ...financialSummaryCardsFragment\n    }\n    id\n  }\n}\n\nfragment categoryCardCategoryFragment on TransactionCategory {\n  id\n  name\n  type\n  icon\n}\n\nfragment categoryCardFinancialReportFragment on FinancialReport {\n  incomeBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n  expensesBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n}\n\nfragment financialSummaryCardsFragment on FinancialReport {\n  incomeBreakdown {\n    total\n  }\n  expensesBreakdown {\n    total\n  }\n}\n"
  }
};
})();

(node as any).hash = "462c3224f639d468d9436dab5f8adaa0";

export default node;
