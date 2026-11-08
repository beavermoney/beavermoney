/**
 * @generated SignedSource<<9ffd175ca9c2c66dff54ba3fe05cda81>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentCryptoQuoteQuery$variables = {
  symbol?: string | null | undefined;
};
export type newInvestmentCryptoQuoteQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentCryptoQuoteFragment">;
};
export type newInvestmentCryptoQuoteQuery = {
  response: newInvestmentCryptoQuoteQuery$data;
  variables: newInvestmentCryptoQuoteQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": "",
    "kind": "LocalArgument",
    "name": "symbol"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "symbol",
    "variableName": "symbol"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newInvestmentCryptoQuoteQuery",
    "selections": [
      {
        "args": (v1/*: any*/),
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
    "name": "newInvestmentCryptoQuoteQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CryptoQuoteResult",
        "kind": "LinkedField",
        "name": "cryptoQuote",
        "plural": false,
        "selections": [
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "639b1a74e079640558d8757cefb6a081",
    "id": null,
    "metadata": {},
    "name": "newInvestmentCryptoQuoteQuery",
    "operationKind": "query",
    "text": "query newInvestmentCryptoQuoteQuery(\n  $symbol: String = \"\"\n) {\n  ...newInvestmentCryptoQuoteFragment_3astM6\n}\n\nfragment newInvestmentCryptoQuoteFragment_3astM6 on Query {\n  cryptoQuote(symbol: $symbol) {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n"
  }
};
})();

(node as any).hash = "317789480b4494719fff3e26c736976b";

export default node;
