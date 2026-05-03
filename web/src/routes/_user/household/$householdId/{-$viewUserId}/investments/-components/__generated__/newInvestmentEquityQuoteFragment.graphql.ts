/**
 * @generated SignedSource<<18bd3cfff8af5a55836617af4d405f22>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentEquityQuoteFragment$data = {
  readonly equityQuote: {
    readonly currency: string;
    readonly currentPrice: string;
    readonly exchange: string;
    readonly name: string;
    readonly symbol: string;
  } | null | undefined;
  readonly " $fragmentType": "newInvestmentEquityQuoteFragment";
};
export type newInvestmentEquityQuoteFragment$key = {
  readonly " $data"?: newInvestmentEquityQuoteFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentEquityQuoteFragment">;
};

import newInvestmentEquityQuoteQuery_graphql from './newInvestmentEquityQuoteQuery.graphql';

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
      "operation": newInvestmentEquityQuoteQuery_graphql
    }
  },
  "name": "newInvestmentEquityQuoteFragment",
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
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "1ec8cabe1d24192438940aac82ad1b2a";

export default node;
