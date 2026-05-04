/**
 * @generated SignedSource<<4738290a4643b66c83de701f70e2c301>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newAccountFragment$data = {
  readonly currencies: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
  }>;
  readonly " $fragmentType": "newAccountFragment";
};
export type newAccountFragment$key = {
  readonly " $data"?: newAccountFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"newAccountFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "newAccountFragment",
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

(node as any).hash = "9f3efb17c0f33bc3da7cdb864f4673ee";

export default node;
