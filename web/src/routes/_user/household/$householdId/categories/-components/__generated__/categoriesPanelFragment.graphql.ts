/**
 * @generated SignedSource<<d52d42db90e5e6d7a239e9b1ae7d0a81>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type categoriesPanelFragment$data = {
  readonly household: {
    readonly financialReport: {
      readonly expensesBreakdown: {
        readonly categoryType: TransactionCategoryType;
        readonly total: string;
        readonly transactionCount: number;
      };
      readonly incomeBreakdown: {
        readonly categoryType: TransactionCategoryType;
        readonly total: string;
        readonly transactionCount: number;
      };
      readonly " $fragmentSpreads": FragmentRefs<"categoryCardFinancialReportFragment" | "financialSummaryCardsFragment">;
    };
  };
  readonly transactionCategories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly type: TransactionCategoryType;
        readonly " $fragmentSpreads": FragmentRefs<"categoryCardCategoryFragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "categoriesPanelFragment";
};
export type categoriesPanelFragment$key = {
  readonly " $data"?: categoriesPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"categoriesPanelFragment">;
};

import categoriesPanelRefetch_graphql from './categoriesPanelRefetch.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "transactionCategories"
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "categoryType",
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
];
return {
  "argumentDefinitions": [
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
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [],
      "operation": categoriesPanelRefetch_graphql
    }
  },
  "name": "categoriesPanelFragment",
  "selections": [
    {
      "alias": "transactionCategories",
      "args": null,
      "concreteType": "TransactionCategoryConnection",
      "kind": "LinkedField",
      "name": "__categoriesPanel_transactionCategories_connection",
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "categoryCardCategoryFragment"
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
              "selections": (v1/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "CategoryTypeAggregate",
              "kind": "LinkedField",
              "name": "expensesBreakdown",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "categoryCardFinancialReportFragment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "financialSummaryCardsFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "462c3224f639d468d9436dab5f8adaa0";

export default node;
