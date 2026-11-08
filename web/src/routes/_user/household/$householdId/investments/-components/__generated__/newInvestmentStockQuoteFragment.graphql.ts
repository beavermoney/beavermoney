/**
 * @generated SignedSource<<2b1c56b7afe3bed8836406156c1e6e89>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentStockQuoteFragment$data = {
  readonly stockQuote: {
    readonly currency: string;
    readonly currentPrice: string;
    readonly exchange: string;
    readonly name: string;
    readonly symbol: string;
  } | null | undefined;
  readonly " $fragmentType": "newInvestmentStockQuoteFragment";
};
export type newInvestmentStockQuoteFragment$key = {
  readonly " $data"?: newInvestmentStockQuoteFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentStockQuoteFragment">;
};

import newInvestmentStockQuoteQuery_graphql from './newInvestmentStockQuoteQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": "",
      "kind": "LocalArgument",
      "name": "symbol"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": newInvestmentStockQuoteQuery_graphql
    }
  },
  "name": "newInvestmentStockQuoteFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "symbol",
          "variableName": "symbol"
        }
      ],
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
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "b0e75f93e89ead741191522dd816a989";

export default node;
