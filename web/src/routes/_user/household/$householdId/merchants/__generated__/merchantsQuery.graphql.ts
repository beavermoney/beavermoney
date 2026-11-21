/**
 * @generated SignedSource<<897fd37a7e513d01539910dac83f3ed2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type merchantsQuery$variables = {
  endDate: any;
  startDate: any;
  viewUserIds?: ReadonlyArray<string> | null | undefined;
};
export type merchantsQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"merchantsPanelFragment">;
  };
};
export type merchantsQuery = {
  response: merchantsQuery$data;
  variables: merchantsQuery$variables;
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
  "name": "viewUserIds"
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "merchantsQuery",
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
                "name": "viewUserIds",
                "variableName": "viewUserIds"
              }
            ],
            "kind": "FragmentSpread",
            "name": "merchantsPanelFragment"
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
    "name": "merchantsQuery",
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
                "selections": (v5/*: any*/),
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
                      (v6/*: any*/),
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
                    "selections": (v5/*: any*/),
                    "storageKey": null
                  }
                ],
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
    "cacheID": "09f7689a8bb1c180d9e9d9ee230e24ec",
    "id": null,
    "metadata": {},
    "name": "merchantsQuery",
    "operationKind": "query",
    "text": "query merchantsQuery(\n  $startDate: Time!\n  $endDate: Time!\n  $viewUserIds: [ID!]\n) {\n  household {\n    ...merchantsPanelFragment_gfap0\n    id\n  }\n}\n\nfragment merchantsPanelFragment_gfap0 on Household {\n  merchantInsights(period: {startDate: $startDate, endDate: $endDate}, viewUserIDs: $viewUserIds) {\n    currencyCode\n    unassigned {\n      total\n      transactionCount\n    }\n    merchants {\n      merchant {\n        id\n        name\n        icon\n      }\n      summary {\n        total\n        transactionCount\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca8269c545d00bc1e0971d48e30e550f";

export default node;
