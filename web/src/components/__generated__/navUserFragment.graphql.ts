/**
 * @generated SignedSource<<51f212a8d6d22c65b1b93731b482bb31>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type navUserFragment$data = {
  readonly user: {
    readonly name: string;
  };
  readonly " $fragmentType": "navUserFragment";
};
export type navUserFragment$key = {
  readonly " $data"?: navUserFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"navUserFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "navUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "012c6ec8518de2d467183c2d6af74895";

export default node;
