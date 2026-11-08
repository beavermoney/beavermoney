/**
 * @generated SignedSource<<03824b7df8a91c4c67e1e2d167eb2a9f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newInvestmentCryptoQuoteFragment$data = {
  readonly cryptoQuote: {
    readonly currency: string;
    readonly currentPrice: string;
    readonly exchange: string;
    readonly name: string;
    readonly symbol: string;
  } | null | undefined;
  readonly " $fragmentType": "newInvestmentCryptoQuoteFragment";
};
export type newInvestmentCryptoQuoteFragment$key = {
  readonly " $data"?: newInvestmentCryptoQuoteFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"newInvestmentCryptoQuoteFragment">;
};

import newInvestmentCryptoQuoteQuery_graphql from './newInvestmentCryptoQuoteQuery.graphql';

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
      "operation": newInvestmentCryptoQuoteQuery_graphql
    }
  },
  "name": "newInvestmentCryptoQuoteFragment",
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
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "317789480b4494719fff3e26c736976b";

export default node;
