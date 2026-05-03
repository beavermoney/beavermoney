/**
 * @generated SignedSource<<3610efe840290db425eb6fd6bd8f8ab9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newSubscriptionFragment$data = {
  readonly currencies: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
  }>;
  readonly " $fragmentType": "newSubscriptionFragment";
};
export type newSubscriptionFragment$key = {
  readonly " $data"?: newSubscriptionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"newSubscriptionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "newSubscriptionFragment",
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

(node as any).hash = "9493371984ad1e9358c26498a6c77abd";

export default node;
