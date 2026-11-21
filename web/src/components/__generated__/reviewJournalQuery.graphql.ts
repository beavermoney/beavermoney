/**
 * @generated SignedSource<<9172de8f658b249353c63a0cf80cbffd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type reviewJournalQuery$variables = {
  count: number;
};
export type reviewJournalQuery$data = {
  readonly household: {
    readonly snapshots: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly createTime: any;
          readonly id: string;
          readonly note: string | null | undefined;
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
    readonly " $fragmentSpreads": FragmentRefs<"snapshotDialogFragment">;
  };
};
export type reviewJournalQuery = {
  response: reviewJournalQuery$data;
  variables: reviewJournalQuery$variables;
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
  "name": "createTime",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "note",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currency",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "archived",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rate",
  "storageKey": null
},
v12 = {
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
        (v6/*: any*/),
        (v7/*: any*/),
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
        (v8/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "cash",
          "storageKey": null
        },
        (v9/*: any*/),
        (v10/*: any*/),
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
            (v6/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "symbol",
              "storageKey": null
            },
            (v8/*: any*/),
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
            (v9/*: any*/),
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
            (v10/*: any*/)
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
        (v11/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userID",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "liquidity",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "investment",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "property",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "receivable",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "liability",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v20 = [
  (v19/*: any*/)
],
v21 = [
  (v19/*: any*/),
  (v3/*: any*/)
],
v22 = [
  (v11/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "HouseholdCurrency",
    "kind": "LinkedField",
    "name": "fromCurrency",
    "plural": false,
    "selections": (v21/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "HouseholdCurrency",
    "kind": "LinkedField",
    "name": "toCurrency",
    "plural": false,
    "selections": (v21/*: any*/),
    "storageKey": null
  },
  (v3/*: any*/)
],
v23 = {
  "alias": null,
  "args": null,
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
  "plural": false,
  "selections": (v21/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "reviewJournalQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "snapshotDialogFragment"
          },
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
                      (v4/*: any*/),
                      (v5/*: any*/),
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SnapshotEntry",
                        "kind": "LinkedField",
                        "name": "snapshotEntries",
                        "plural": true,
                        "selections": [
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/),
                          (v17/*: any*/),
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "householdCurrency",
                            "plural": false,
                            "selections": (v20/*: any*/),
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
                          (v11/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "fromCurrency",
                            "plural": false,
                            "selections": (v20/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "HouseholdCurrency",
                            "kind": "LinkedField",
                            "name": "toCurrency",
                            "plural": false,
                            "selections": (v20/*: any*/),
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
    "name": "reviewJournalQuery",
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
            "args": null,
            "concreteType": "HouseholdRate",
            "kind": "LinkedField",
            "name": "householdRates",
            "plural": true,
            "selections": (v22/*: any*/),
            "storageKey": null
          },
          {
            "alias": "reviewAccounts",
            "args": [
              {
                "kind": "Literal",
                "name": "where",
                "value": {
                  "archived": false
                }
              }
            ],
            "concreteType": "AccountConnection",
            "kind": "LinkedField",
            "name": "accounts",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AccountEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Account",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v6/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "reviewRevision",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Investment",
                        "kind": "LinkedField",
                        "name": "investments",
                        "plural": true,
                        "selections": [
                          (v3/*: any*/),
                          (v6/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "averageNeedsReview",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v7/*: any*/),
                      (v9/*: any*/),
                      (v23/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "accounts(where:{\"archived\":false})"
          },
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
                      (v4/*: any*/),
                      (v5/*: any*/),
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SnapshotEntry",
                        "kind": "LinkedField",
                        "name": "snapshotEntries",
                        "plural": true,
                        "selections": [
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/),
                          (v17/*: any*/),
                          (v18/*: any*/),
                          (v23/*: any*/),
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
                        "selections": (v22/*: any*/),
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
    "cacheID": "8abd0dccaa45a10193297a0c93b85d32",
    "id": null,
    "metadata": {},
    "name": "reviewJournalQuery",
    "operationKind": "query",
    "text": "query reviewJournalQuery(\n  $count: Int!\n) {\n  household {\n    ...snapshotDialogFragment\n    snapshots(last: $count) {\n      pageInfo {\n        hasPreviousPage\n      }\n      edges {\n        node {\n          id\n          createTime\n          note\n          review {\n            version\n            complete\n            activeAccountIds\n            accounts {\n              accountId\n              icon\n              name\n              type\n              category\n              ownerId\n              ownerName\n              currency\n              cash\n              value\n              archived\n              holdings {\n                investmentId\n                name\n                symbol\n                currency\n                quantity\n                price\n                value\n                average\n                confirmedAt\n                needsReview\n                archived\n              }\n            }\n            rates {\n              from\n              to\n              rate\n            }\n          }\n          snapshotEntries {\n            userID\n            liquidity\n            investment\n            property\n            receivable\n            liability\n            householdCurrency {\n              code\n              id\n            }\n            id\n          }\n          snapshotRates {\n            rate\n            fromCurrency {\n              code\n              id\n            }\n            toCurrency {\n              code\n              id\n            }\n            id\n          }\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment snapshotDialogFragment on Household {\n  householdRates {\n    rate\n    fromCurrency {\n      code\n      id\n    }\n    toCurrency {\n      code\n      id\n    }\n    id\n  }\n  reviewAccounts: accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        reviewRevision\n        investments {\n          id\n          name\n          averageNeedsReview\n        }\n        type\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8880bf060083099deabbb73abb07821e";

export default node;
