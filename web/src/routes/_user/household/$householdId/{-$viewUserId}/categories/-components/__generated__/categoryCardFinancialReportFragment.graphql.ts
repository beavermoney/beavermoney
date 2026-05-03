/**
 * @generated SignedSource<<fee6c8eebe2c2fe868274aadf98302a6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type categoryCardFinancialReportFragment$data = {
  readonly expensesBreakdown: {
    readonly categories: ReadonlyArray<{
      readonly category: {
        readonly id: string;
      };
      readonly total: string;
      readonly transactionCount: number;
    }>;
  };
  readonly incomeBreakdown: {
    readonly categories: ReadonlyArray<{
      readonly category: {
        readonly id: string;
      };
      readonly total: string;
      readonly transactionCount: number;
    }>;
  };
  readonly " $fragmentType": "categoryCardFinancialReportFragment";
};
export type categoryCardFinancialReportFragment$key = {
  readonly " $data"?: categoryCardFinancialReportFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"categoryCardFinancialReportFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
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
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "categoryCardFinancialReportFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "CategoryTypeAggregate",
      "kind": "LinkedField",
      "name": "incomeBreakdown",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "CategoryTypeAggregate",
      "kind": "LinkedField",
      "name": "expensesBreakdown",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "FinancialReport",
  "abstractKey": null
};
})();

(node as any).hash = "5ff05a9cfe532e59324fc908e4639c8d";

export default node;
