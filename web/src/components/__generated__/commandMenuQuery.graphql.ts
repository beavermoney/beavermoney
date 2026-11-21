/**
 * @generated SignedSource<<b587fbd7ebb1823cbc6ca45b87ba9cfe>>
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
  "kind": "Literal",
  "name": "archived",
  "value": false
},
v3 = {
  "kind": "Variable",
  "name": "userIDIn",
  "variableName": "viewUserIds"
},
v4 = [
  {
    "fields": [
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
  "name": "icon",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v6/*: any*/)
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
  "plural": false,
  "selections": [
    (v9/*: any*/)
  ],
  "storageKey": null
},
v11 = [
  {
    "fields": [
      (v2/*: any*/),
      {
        "kind": "Literal",
        "name": "hasAccountWith",
        "value": {
          "archived": false
        }
      },
      (v3/*: any*/)
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "symbol",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v6/*: any*/),
    (v5/*: any*/)
  ],
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
  "plural": false,
  "selections": [
    (v9/*: any*/),
    (v5/*: any*/)
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
              {
                "alias": null,
                "args": (v4/*: any*/),
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
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v7/*: any*/),
                          (v8/*: any*/),
                          (v10/*: any*/)
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
                "args": (v11/*: any*/),
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
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v12/*: any*/),
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Account",
                            "kind": "LinkedField",
                            "name": "account",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v8/*: any*/),
                              (v10/*: any*/)
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
              {
                "alias": null,
                "args": (v4/*: any*/),
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
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v7/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/)
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
                "args": (v11/*: any*/),
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
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v12/*: any*/),
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Account",
                            "kind": "LinkedField",
                            "name": "account",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v14/*: any*/),
                              (v15/*: any*/),
                              (v5/*: any*/)
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
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3593befd476a77bfd12ba950b5ef611b",
    "id": null,
    "metadata": {},
    "name": "commandMenuQuery",
    "operationKind": "query",
    "text": "query commandMenuQuery(\n  $householdId: ID!\n  $viewUserIds: [ID!]\n) {\n  node(id: $householdId) {\n    __typename\n    ... on Household {\n      accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n        edges {\n          node {\n            id\n            name\n            icon\n            user {\n              name\n              id\n            }\n            householdCurrency {\n              code\n              id\n            }\n          }\n        }\n      }\n      investments(where: {archived: false, userIDIn: $viewUserIds, hasAccountWith: {archived: false}}) {\n        edges {\n          node {\n            id\n            name\n            symbol\n            type\n            account {\n              name\n              icon\n              user {\n                name\n                id\n              }\n              householdCurrency {\n                code\n                id\n              }\n              id\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a0ad27200c22633f47d255e516d9510c";

export default node;
