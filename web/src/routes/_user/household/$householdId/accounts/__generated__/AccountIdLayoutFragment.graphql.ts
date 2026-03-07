/**
 * @generated SignedSource<<fcf12cfd998fe96fc657e8f5b8da81b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AccountIdLayoutFragment$data = {
  readonly archived: boolean;
  readonly id: string;
  readonly " $fragmentType": "AccountIdLayoutFragment";
};
export type AccountIdLayoutFragment$key = {
  readonly " $data"?: AccountIdLayoutFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AccountIdLayoutFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AccountIdLayoutFragment",
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
      "name": "archived",
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};

(node as any).hash = "597b23c75f3d06685684bb8d476a6db9";

export default node;
