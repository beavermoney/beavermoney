/**
 * @generated SignedSource<<39418d733e4572670bd0da525b18a3bc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CategoryIdQuery$variables = {
  endDate: any;
  id: string;
  startDate: any;
};
export type CategoryIdQuery$data = {
  readonly financialReport: {
    readonly " $fragmentSpreads": FragmentRefs<"categoryCardFinancialReportFragment">;
  };
  readonly node: {
    readonly id?: string;
    readonly " $fragmentSpreads": FragmentRefs<"categoryCardCategoryFragment" | "editCategoryFragment">;
  } | null | undefined;
};
export type CategoryIdQuery = {
  response: CategoryIdQuery$data;
  variables: CategoryIdQuery$variables;
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
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startDate"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "endDate",
        "variableName": "endDate"
      },
      {
        "kind": "Variable",
        "name": "startDate",
        "variableName": "startDate"
      }
    ],
    "kind": "ObjectValue",
    "name": "period"
  }
],
v6 = [
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "total",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "transactionCount",
        "storageKey": null
      }
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
    "name": "CategoryIdQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "categoryCardCategoryFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "editCategoryFragment"
              }
            ],
            "type": "TransactionCategory",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "FinancialReport",
        "kind": "LinkedField",
        "name": "financialReport",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "categoryCardFinancialReportFragment"
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
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "CategoryIdQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
                "name": "type",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "icon",
                "storageKey": null
              }
            ],
            "type": "TransactionCategory",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v5/*: any*/),
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
            "selections": (v6/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "CategoryTypeAggregate",
            "kind": "LinkedField",
            "name": "expensesBreakdown",
            "plural": false,
            "selections": (v6/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "649813404d7735f3b854a9c9c983eee9",
    "id": null,
    "metadata": {},
    "name": "CategoryIdQuery",
    "operationKind": "query",
    "text": "query CategoryIdQuery(\n  $id: ID!\n  $startDate: Time!\n  $endDate: Time!\n) {\n  node(id: $id) {\n    __typename\n    ... on TransactionCategory {\n      id\n      ...categoryCardCategoryFragment\n      ...editCategoryFragment\n    }\n    id\n  }\n  financialReport(period: {startDate: $startDate, endDate: $endDate}) {\n    ...categoryCardFinancialReportFragment\n  }\n}\n\nfragment categoryCardCategoryFragment on TransactionCategory {\n  id\n  name\n  type\n  icon\n}\n\nfragment categoryCardFinancialReportFragment on FinancialReport {\n  incomeBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n  expensesBreakdown {\n    categories {\n      category {\n        id\n      }\n      total\n      transactionCount\n    }\n  }\n}\n\nfragment editCategoryFragment on TransactionCategory {\n  id\n  name\n  type\n  icon\n}\n"
  }
};
})();

(node as any).hash = "b3d9d9ea3e9ac32c4d60fe027c92c9d5";

export default node;
