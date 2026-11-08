/**
 * @generated SignedSource<<a88ce957be90ba7d16724ac49c32f9a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentQuery$variables = {
  viewUserIds?: ReadonlyArray<string> | null | undefined;
};
export type newInvestmentQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"newInvestmentFragment">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentCryptoQuoteFragment" | "newInvestmentStockQuoteFragment">;
};
export type newInvestmentQuery = {
  response: newInvestmentQuery$data;
  variables: newInvestmentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "viewUserIds"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "symbol",
    "value": ""
  }
],
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "currentPrice",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "symbol",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "exchange",
    "storageKey": null
  },
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "currency",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newInvestmentQuery",
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
              {
                "kind": "Variable",
                "name": "viewUserIds",
                "variableName": "viewUserIds"
              }
            ],
            "kind": "FragmentSpread",
            "name": "newInvestmentFragment"
          }
        ],
        "storageKey": null
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "newInvestmentStockQuoteFragment"
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "newInvestmentCryptoQuoteFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newInvestmentQuery",
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
                  {
                    "kind": "Literal",
                    "name": "archived",
                    "value": false
                  },
                  {
                    "kind": "Variable",
                    "name": "userIDIn",
                    "variableName": "viewUserIds"
                  }
                ],
                "kind": "ObjectValue",
                "name": "where"
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
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
                        "storageKey": null
                      },
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "icon",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "value",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "HouseholdCurrency",
                        "kind": "LinkedField",
                        "name": "householdCurrency",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "code",
                            "storageKey": null
                          },
                          (v1/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "user",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v1/*: any*/)
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
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "StockQuoteResult",
        "kind": "LinkedField",
        "name": "stockQuote",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": "stockQuote(symbol:\"\")"
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "CryptoQuoteResult",
        "kind": "LinkedField",
        "name": "cryptoQuote",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": "cryptoQuote(symbol:\"\")"
      }
    ]
  },
  "params": {
    "cacheID": "1d810242ad5cef50ed0a107d8e491352",
    "id": null,
    "metadata": {},
    "name": "newInvestmentQuery",
    "operationKind": "query",
    "text": "query newInvestmentQuery(\n  $viewUserIds: [ID!]\n) {\n  household {\n    ...newInvestmentFragment_3rIbPZ\n    id\n  }\n  ...newInvestmentStockQuoteFragment\n  ...newInvestmentCryptoQuoteFragment\n}\n\nfragment newInvestmentCryptoQuoteFragment on Query {\n  cryptoQuote(symbol: \"\") {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n\nfragment newInvestmentFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        type\n        name\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n        user {\n          name\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment newInvestmentStockQuoteFragment on Query {\n  stockQuote(symbol: \"\") {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n"
  }
};
})();

(node as any).hash = "a7af99fb4b124b48425c3aa8b2379f49";

export default node;
