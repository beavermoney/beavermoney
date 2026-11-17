/**
 * @generated SignedSource<<34c3558849f86441860d16bed6d4bbd0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type newInvestmentQuoteLookupQuery$variables = {
  crypto: boolean;
  symbol: string;
};
export type newInvestmentQuoteLookupQuery$data = {
  readonly cryptoQuote?: {
    readonly currency: string;
    readonly currentPrice: string;
    readonly exchange: string;
    readonly name: string;
    readonly symbol: string;
  } | null | undefined;
  readonly stockQuote?: {
    readonly currency: string;
    readonly currentPrice: string;
    readonly exchange: string;
    readonly name: string;
    readonly symbol: string;
  } | null | undefined;
};
export type newInvestmentQuoteLookupQuery = {
  response: newInvestmentQuoteLookupQuery$data;
  variables: newInvestmentQuoteLookupQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "crypto"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "symbol"
},
v2 = [
  {
    "kind": "Variable",
    "name": "symbol",
    "variableName": "symbol"
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
    "name": "currency",
    "storageKey": null
  }
],
v4 = [
  {
    "condition": "crypto",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "StockQuoteResult",
        "kind": "LinkedField",
        "name": "stockQuote",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "crypto",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CryptoQuoteResult",
        "kind": "LinkedField",
        "name": "cryptoQuote",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "newInvestmentQuoteLookupQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "newInvestmentQuoteLookupQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "bd0a96973d4dceaf936b6d49454c8830",
    "id": null,
    "metadata": {},
    "name": "newInvestmentQuoteLookupQuery",
    "operationKind": "query",
    "text": "query newInvestmentQuoteLookupQuery(\n  $symbol: String!\n  $crypto: Boolean!\n) {\n  stockQuote(symbol: $symbol) @skip(if: $crypto) {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n  cryptoQuote(symbol: $symbol) @include(if: $crypto) {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n"
  }
};
})();

(node as any).hash = "3412084f97479aed9c6b58265bd8d17d";

export default node;
