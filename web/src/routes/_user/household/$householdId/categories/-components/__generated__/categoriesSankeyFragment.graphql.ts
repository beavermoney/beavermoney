/**
 * @generated SignedSource<<f4797b6ba8f5dafaa62a6d51fe3c569d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type categoriesSankeyFragment$data = {
  readonly expensesBreakdown: {
    readonly categories: ReadonlyArray<{
      readonly category: {
        readonly icon: string;
        readonly id: string;
        readonly name: string;
      };
      readonly total: string;
    }>;
    readonly total: string;
  };
  readonly incomeBreakdown: {
    readonly categories: ReadonlyArray<{
      readonly category: {
        readonly icon: string;
        readonly id: string;
        readonly name: string;
      };
      readonly total: string;
    }>;
    readonly total: string;
  };
  readonly " $fragmentType": "categoriesSankeyFragment";
};
export type categoriesSankeyFragment$key = {
  readonly " $data"?: categoriesSankeyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"categoriesSankeyFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v1 = [
  (v0/*: any*/),
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
          }
        ],
        "storageKey": null
      },
      (v0/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "categoriesSankeyFragment",
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
    }
  ],
  "type": "FinancialReport",
  "abstractKey": null
};
})();

(node as any).hash = "4af0b1333bb31bd2ebbe453b534360cc";

export default node;
