/**
 * @generated SignedSource<<5f0c113656903ace7ca9f0b120c5c3c7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type editAccountFragment$data = {
  readonly archived: boolean;
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly value: string;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "archived",
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};

(node as any).hash = "f46770b474d6fb4d39e51b2eea420a49";

export default node;
