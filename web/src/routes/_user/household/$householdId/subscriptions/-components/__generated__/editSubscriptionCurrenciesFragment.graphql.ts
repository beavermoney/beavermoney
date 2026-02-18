/**
 * @generated SignedSource<<230e5a632d780379d3cfb58a46496542>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type editSubscriptionCurrenciesFragment$data = {
  readonly currencies: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
  }>;
  readonly " $fragmentType": "editSubscriptionCurrenciesFragment";
};
export type editSubscriptionCurrenciesFragment$key = {
  readonly " $data"?: editSubscriptionCurrenciesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editSubscriptionCurrenciesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editSubscriptionCurrenciesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Currency",
      "kind": "LinkedField",
      "name": "currencies",
      "plural": true,
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
          "kind": "ScalarField",
          "name": "code",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "10895a12971d415b68d6e73287434819";

export default node;
