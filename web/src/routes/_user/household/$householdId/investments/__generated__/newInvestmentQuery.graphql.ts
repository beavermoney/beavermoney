/**
 * @generated SignedSource<<cecc3b79e6f3a4e2a1b159c35fa3f7b7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentQuery$variables = Record<PropertyKey, never>;
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
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  {
    "kind": "Literal",
    "name": "symbol",
    "value": ""
  }
],
v3 = [
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
  (v1/*: any*/),
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
    "argumentDefinitions": [],
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
            "args": null,
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
    "argumentDefinitions": [],
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
                      (v0/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
                        "storageKey": null
                      },
                      (v1/*: any*/),
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
                        "concreteType": "Currency",
                        "kind": "LinkedField",
                        "name": "currency",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "code",
                            "storageKey": null
                          },
                          (v0/*: any*/)
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
            "storageKey": "accounts(where:{\"archived\":false})"
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "StockQuoteResult",
        "kind": "LinkedField",
        "name": "stockQuote",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": "stockQuote(symbol:\"\")"
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CryptoQuoteResult",
        "kind": "LinkedField",
        "name": "cryptoQuote",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": "cryptoQuote(symbol:\"\")"
      }
    ]
  },
  "params": {
    "cacheID": "b7513d87d3fba0f4879546597099265a",
    "id": null,
    "metadata": {},
    "name": "newInvestmentQuery",
    "operationKind": "query",
    "text": "query newInvestmentQuery {\n  household {\n    ...newInvestmentFragment\n    id\n  }\n  ...newInvestmentStockQuoteFragment\n  ...newInvestmentCryptoQuoteFragment\n}\n\nfragment newInvestmentCryptoQuoteFragment on Query {\n  cryptoQuote(symbol: \"\") {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n\nfragment newInvestmentFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        type\n        name\n        icon\n        value\n        currency {\n          code\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment newInvestmentStockQuoteFragment on Query {\n  stockQuote(symbol: \"\") {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n"
  }
};
})();

(node as any).hash = "a767ce92434925fc02e70d5833890286";

export default node;
