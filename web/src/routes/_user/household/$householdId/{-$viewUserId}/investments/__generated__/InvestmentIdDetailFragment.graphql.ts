/**
 * @generated SignedSource<<fc3a65e7c90d0e20d0826ce718077492>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InvestmentIdDetailFragment$data = {
  readonly averageCost: string;
  readonly costBasis: string;
  readonly householdCurrency: {
    readonly code: string;
  };
  readonly unrealizedReturn: string;
  readonly unrealizedReturnPercent: string;
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

(node as any).hash = "a10b3f45699108991e7e8ac2557b0253";

export default node;
