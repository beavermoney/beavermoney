/**
 * @generated SignedSource<<8599de9693a7dbbb988f9ad0fd928d98>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useUserFragment$data = {
  readonly email: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "useUserFragment";
};
export type useUserFragment$key = {
  readonly " $data"?: useUserFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useUserFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useUserFragment",
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
      "name": "email",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "450fcc559dd0dbd394a00f3e288af06c";

export default node;
