/**
 * @generated SignedSource<<a63c6b652c58df72c1f559067e3f7f6d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentStockQuoteQuery$variables = {
  symbol?: string | null | undefined;
};
export type newInvestmentStockQuoteQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentStockQuoteFragment">;
};
export type newInvestmentStockQuoteQuery = {
  response: newInvestmentStockQuoteQuery$data;
  variables: newInvestmentStockQuoteQuery$variables;
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
    "name": "newInvestmentStockQuoteQuery",
    "selections": [
      {
        "args": (v1/*: any*/),
        "kind": "FragmentSpread",
        "name": "newInvestmentStockQuoteFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newInvestmentStockQuoteQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "StockQuoteResult",
        "kind": "LinkedField",
        "name": "stockQuote",
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
    "cacheID": "2d9554a0e3142673134cdb0f12932b3c",
    "id": null,
    "metadata": {},
    "name": "newInvestmentStockQuoteQuery",
    "operationKind": "query",
    "text": "query newInvestmentStockQuoteQuery(\n  $symbol: String = \"\"\n) {\n  ...newInvestmentStockQuoteFragment_3astM6\n}\n\nfragment newInvestmentStockQuoteFragment_3astM6 on Query {\n  stockQuote(symbol: $symbol) {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n"
  }
};
})();

(node as any).hash = "b0e75f93e89ead741191522dd816a989";

export default node;
