/**
 * @generated SignedSource<<73aef03d3f8ffd73e61e28cd861bc430>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InvestmentType = "crypto" | "stock" | "%future added value";
export type commandMenuQuery$variables = {
  householdId: string;
  viewUserIds?: ReadonlyArray<string> | null | undefined;
};
export type commandMenuQuery$data = {
  readonly node: {
    readonly accounts?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly householdCurrency: {
            readonly code: string;
          };
          readonly icon: string | null | undefined;
          readonly id: string;
          readonly name: string;
          readonly user: {
            readonly name: string;
          };
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly investments?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly account: {
            readonly householdCurrency: {
              readonly code: string;
            };
            readonly icon: string | null | undefined;
            readonly name: string;
            readonly user: {
              readonly name: string;
            };
          };
          readonly id: string;
          readonly name: string;
          readonly symbol: string;
          readonly type: InvestmentType;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly merchants?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly icon: string | null | undefined;
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
  } | null | undefined;
};
export type commandMenuQuery = {
  response: commandMenuQuery$data;
  variables: commandMenuQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "householdId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "viewUserIds"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "householdId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "MerchantConnection",
  "kind": "LinkedField",
  "name": "merchants",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "MerchantEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Merchant",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            (v3/*: any*/),
            (v4/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
  "kind": "Literal",
  "name": "archived",
  "value": false
},
v7 = {
  "kind": "Variable",
  "name": "userIDIn",
  "variableName": "viewUserIds"
},
v8 = [
  {
    "fields": [
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v3/*: any*/)
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
  "plural": false,
  "selections": [
    (v10/*: any*/)
  ],
  "storageKey": null
},
v12 = [
  {
    "fields": [
      (v6/*: any*/),
      {
        "kind": "Literal",
        "name": "hasAccountWith",
        "value": {
          "archived": false
        }
      },
      (v7/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
],
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "symbol",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "commandMenuQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                          (v2/*: any*/),
                          (v3/*: any*/),
                          (v4/*: any*/),
                          (v9/*: any*/),
                          (v11/*: any*/)
                        ],
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
                "args": (v12/*: any*/),
                "concreteType": "InvestmentConnection",
                "kind": "LinkedField",
                "name": "investments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "InvestmentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Investment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v3/*: any*/),
                          (v13/*: any*/),
                          (v14/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Account",
                            "kind": "LinkedField",
                            "name": "account",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/),
                              (v4/*: any*/),
                              (v9/*: any*/),
                              (v11/*: any*/)
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
            "type": "Household",
            "abstractKey": null
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
    "name": "commandMenuQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                          (v2/*: any*/),
                          (v3/*: any*/),
                          (v4/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/)
                        ],
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
                "args": (v12/*: any*/),
                "concreteType": "InvestmentConnection",
                "kind": "LinkedField",
                "name": "investments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "InvestmentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Investment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v3/*: any*/),
                          (v13/*: any*/),
                          (v14/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Account",
                            "kind": "LinkedField",
                            "name": "account",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/),
                              (v4/*: any*/),
                              (v15/*: any*/),
                              (v16/*: any*/),
                              (v2/*: any*/)
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
            "type": "Household",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c0c9c48f576766e986186f0203e81a18",
    "id": null,
    "metadata": {},
    "name": "commandMenuQuery",
    "operationKind": "query",
    "text": "query commandMenuQuery(\n  $householdId: ID!\n  $viewUserIds: [ID!]\n) {\n  node(id: $householdId) {\n    __typename\n    ... on Household {\n      merchants {\n        edges {\n          node {\n            id\n            name\n            icon\n          }\n        }\n      }\n      accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n        edges {\n          node {\n            id\n            name\n            icon\n            user {\n              name\n              id\n            }\n            householdCurrency {\n              code\n              id\n            }\n          }\n        }\n      }\n      investments(where: {archived: false, userIDIn: $viewUserIds, hasAccountWith: {archived: false}}) {\n        edges {\n          node {\n            id\n            name\n            symbol\n            type\n            account {\n              name\n              icon\n              user {\n                name\n                id\n              }\n              householdCurrency {\n                code\n                id\n              }\n              id\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1812bff8a096d1119d6d163321087edb";

export default node;
