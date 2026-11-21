/**
 * @generated SignedSource<<82c7499bbff1a00298bf19370a9f8659>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type netWorthChartQuery$variables = {
  count: number;
};
export type netWorthChartQuery$data = {
  readonly household: {
    readonly snapshots: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly createTime: any;
          readonly id: string;
          readonly review: {
            readonly accounts: ReadonlyArray<{
              readonly accountId: string;
              readonly archived: boolean;
              readonly cash: string;
              readonly category: string | null | undefined;
              readonly currency: string;
              readonly holdings: ReadonlyArray<{
                readonly archived: boolean;
                readonly average: string | null | undefined;
                readonly confirmedAt: any | null | undefined;
                readonly currency: string;
                readonly investmentId: string;
                readonly name: string;
                readonly needsReview: boolean;
                readonly price: string;
                readonly quantity: string;
                readonly symbol: string;
                readonly value: string;
              }>;
              readonly icon: string | null | undefined;
              readonly name: string;
              readonly ownerId: string;
              readonly ownerName: string;
              readonly type: string;
              readonly value: string;
            }>;
            readonly activeAccountIds: ReadonlyArray<string>;
            readonly complete: boolean;
            readonly rates: ReadonlyArray<{
              readonly from: string;
              readonly rate: string;
              readonly to: string;
            }>;
            readonly version: number;
          } | null | undefined;
          readonly snapshotEntries: ReadonlyArray<{
            readonly householdCurrency: {
              readonly code: string;
            };
            readonly investment: string;
            readonly liability: string;
            readonly liquidity: string;
            readonly property: string;
            readonly receivable: string;
            readonly userID: string;
          }> | null | undefined;
          readonly snapshotRates: ReadonlyArray<{
            readonly fromCurrency: {
              readonly code: string;
            };
            readonly rate: string;
            readonly toCurrency: {
              readonly code: string;
            };
          }> | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly pageInfo: {
        readonly hasPreviousPage: boolean;
      };
    };
  };
};
export type netWorthChartQuery = {
  response: netWorthChartQuery$data;
  variables: netWorthChartQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "count"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "count"
  }
],
v2 = {
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
      "name": "hasPreviousPage",
      "storageKey": null
    }
  ],
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
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currency",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "archived",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rate",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "SnapshotReview",
  "kind": "LinkedField",
  "name": "review",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "version",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "complete",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "activeAccountIds",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SnapshotAccountState",
      "kind": "LinkedField",
      "name": "accounts",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "accountId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "icon",
          "storageKey": null
        },
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
          "name": "category",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "ownerId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "ownerName",
          "storageKey": null
        },
        (v5/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "cash",
          "storageKey": null
        },
        (v6/*: any*/),
        (v7/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "SnapshotInvestmentState",
          "kind": "LinkedField",
          "name": "holdings",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "investmentId",
              "storageKey": null
            },
            (v4/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "symbol",
              "storageKey": null
            },
            (v5/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "quantity",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "price",
              "storageKey": null
            },
            (v6/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "average",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "confirmedAt",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "needsReview",
              "storageKey": null
            },
            (v7/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SnapshotRateState",
      "kind": "LinkedField",
      "name": "rates",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "from",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "to",
          "storageKey": null
        },
        (v8/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createTime",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userID",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "liquidity",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "investment",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "property",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "receivable",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "liability",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v18 = [
  (v17/*: any*/)
],
v19 = [
  (v17/*: any*/),
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "netWorthChartQuery",
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
            "args": (v1/*: any*/),
            "concreteType": "SnapshotConnection",
            "kind": "LinkedField",
            "name": "snapshots",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "SnapshotEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Snapshot",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SnapshotEntry",
                        "kind": "LinkedField",
                        "name": "snapshotEntries",
                        "plural": true,
                        "selections": [
                          (v11/*: any*/),
                          (v12/*: any*/),
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "householdCurrency",
                            "plural": false,
                            "selections": (v18/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SnapshotRate",
                        "kind": "LinkedField",
                        "name": "snapshotRates",
                        "plural": true,
                        "selections": [
                          (v8/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "fromCurrency",
                            "plural": false,
                            "selections": (v18/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "toCurrency",
                            "plural": false,
                            "selections": (v18/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
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
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "netWorthChartQuery",
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
            "args": (v1/*: any*/),
            "concreteType": "SnapshotConnection",
            "kind": "LinkedField",
            "name": "snapshots",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "SnapshotEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Snapshot",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SnapshotEntry",
                        "kind": "LinkedField",
                        "name": "snapshotEntries",
                        "plural": true,
                        "selections": [
                          (v11/*: any*/),
                          (v12/*: any*/),
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "householdCurrency",
                            "plural": false,
                            "selections": (v19/*: any*/),
                            "storageKey": null
                          },
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SnapshotRate",
                        "kind": "LinkedField",
                        "name": "snapshotRates",
                        "plural": true,
                        "selections": [
                          (v8/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "fromCurrency",
                            "plural": false,
                            "selections": (v19/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "toCurrency",
                            "plural": false,
                            "selections": (v19/*: any*/),
                            "storageKey": null
                          },
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8f6161a9304179934f6114be7f16b67c",
    "id": null,
    "metadata": {},
    "name": "netWorthChartQuery",
    "operationKind": "query",
    "text": "query netWorthChartQuery(\n  $count: Int!\n) {\n  household {\n    snapshots(last: $count) {\n      pageInfo {\n        hasPreviousPage\n      }\n      edges {\n        node {\n          id\n          review {\n            version\n            complete\n            activeAccountIds\n            accounts {\n              accountId\n              icon\n              name\n              type\n              category\n              ownerId\n              ownerName\n              currency\n              cash\n              value\n              archived\n              holdings {\n                investmentId\n                name\n                symbol\n                currency\n                quantity\n                price\n                value\n                average\n                confirmedAt\n                needsReview\n                archived\n              }\n            }\n            rates {\n              from\n              to\n              rate\n            }\n          }\n          createTime\n          snapshotEntries {\n            userID\n            liquidity\n            investment\n            property\n            receivable\n            liability\n            householdCurrency {\n              code\n              id\n            }\n            id\n          }\n          snapshotRates {\n            rate\n            fromCurrency {\n              code\n              id\n            }\n            toCurrency {\n              code\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1f1a00ba41c59ee524db50b124c1324f";

export default node;
