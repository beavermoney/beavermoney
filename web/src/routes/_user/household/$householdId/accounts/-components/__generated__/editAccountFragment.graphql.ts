/**
 * @generated SignedSource<<29c1cd964fb37ea11c639d6bd85ef6f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type editAccountFragment$data = {
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "editAccountFragment";
};
export type editAccountFragment$key = {
  readonly " $data"?: editAccountFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editAccountFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editAccountFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "icon",
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};

(node as any).hash = "630c6f2125e3ea05a8c3cb85ef7ca673";

export default node;
