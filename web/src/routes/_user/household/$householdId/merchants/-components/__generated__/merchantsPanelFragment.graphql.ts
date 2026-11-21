/**
 * @generated SignedSource<<06660d7586e3367138ea5d65ed6aff5f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type merchantsPanelFragment$data = {
  readonly merchantInsights: {
    readonly currencyCode: string;
    readonly merchants: ReadonlyArray<{
      readonly merchant: {
        readonly icon: string | null | undefined;
        readonly id: string;
        readonly name: string;
      };
      readonly summary: {
        readonly total: string;
        readonly transactionCount: number;
      };
    }>;
    readonly unassigned: {
      readonly total: string;
      readonly transactionCount: number;
    };
  };
  readonly " $fragmentType": "merchantsPanelFragment";
};
export type merchantsPanelFragment$key = {
  readonly " $data"?: merchantsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"merchantsPanelFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
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
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "endDate"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "startDate"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "viewUserIds"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "merchantsPanelFragment",
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
        },
        {
          "kind": "Variable",
          "name": "viewUserIDs",
          "variableName": "viewUserIds"
        }
      ],
      "concreteType": "MerchantOverview",
      "kind": "LinkedField",
      "name": "merchantInsights",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "currencyCode",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "MerchantSpendSummary",
          "kind": "LinkedField",
          "name": "unassigned",
          "plural": false,
          "selections": (v0/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "MerchantPeriodSummary",
          "kind": "LinkedField",
          "name": "merchants",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Merchant",
              "kind": "LinkedField",
              "name": "merchant",
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
            {
              "alias": null,
              "args": null,
              "concreteType": "MerchantSpendSummary",
              "kind": "LinkedField",
              "name": "summary",
              "plural": false,
              "selections": (v0/*: any*/),
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "0dcaeefdccfca7c4dd5622ac9bca13aa";

export default node;
