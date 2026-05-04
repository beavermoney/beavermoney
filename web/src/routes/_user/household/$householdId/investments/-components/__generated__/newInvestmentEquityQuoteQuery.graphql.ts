/**
 * @generated SignedSource<<913050653b49f8d0ca7883d35e679f3c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentEquityQuoteQuery$variables = {
  symbol?: string | null | undefined;
};
export type newInvestmentEquityQuoteQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentEquityQuoteFragment">;
};
export type newInvestmentEquityQuoteQuery = {
  response: newInvestmentEquityQuoteQuery$data;
  variables: newInvestmentEquityQuoteQuery$variables;
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
    "name": "newInvestmentEquityQuoteQuery",
    "selections": [
      {
        "args": (v1/*: any*/),
        "kind": "FragmentSpread",
        "name": "newInvestmentEquityQuoteFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newInvestmentEquityQuoteQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EquityQuoteResult",
        "kind": "LinkedField",
        "name": "equityQuote",
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
    "cacheID": "2450b40b188bf14c42121111d6e9b119",
    "id": null,
    "metadata": {},
    "name": "newInvestmentEquityQuoteQuery",
    "operationKind": "query",
    "text": "query newInvestmentEquityQuoteQuery(\n  $symbol: String = \"\"\n) {\n  ...newInvestmentEquityQuoteFragment_3astM6\n}\n\nfragment newInvestmentEquityQuoteFragment_3astM6 on Query {\n  equityQuote(symbol: $symbol) {\n    currentPrice\n    symbol\n    exchange\n    name\n    currency\n  }\n}\n"
  }
};
})();

(node as any).hash = "1ec8cabe1d24192438940aac82ad1b2a";

export default node;
