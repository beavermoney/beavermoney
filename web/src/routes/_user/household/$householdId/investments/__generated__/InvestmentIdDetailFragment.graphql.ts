/**
 * @generated SignedSource<<6729acc08d1212f8472fcecc58a4f46f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InvestmentIdDetailFragment$data = {
  readonly archived: boolean;
  readonly averageCost: string | null | undefined;
  readonly averageNeedsReview: boolean;
  readonly costBasis: string | null | undefined;
  readonly householdCurrency: {
    readonly code: string;
  };
  readonly id: string;
  readonly unrealizedReturn: string | null | undefined;
  readonly unrealizedReturnPercent: string | null | undefined;
  readonly " $fragmentType": "InvestmentIdDetailFragment";
};
export type InvestmentIdDetailFragment$key = {
  readonly " $data"?: InvestmentIdDetailFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InvestmentIdDetailFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InvestmentIdDetailFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
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
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "archived",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "averageNeedsReview",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "costBasis",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "averageCost",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unrealizedReturn",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unrealizedReturnPercent",
      "storageKey": null
    }
  ],
  "type": "Investment",
  "abstractKey": null
};

(node as any).hash = "ca9a546b58a7bee58d4e820b9c78add1";

export default node;
