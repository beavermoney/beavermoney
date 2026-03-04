/**
 * @generated SignedSource<<abbf6c2be3b1d364365a691cf4b56e8f>>
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
    readonly email: string;
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "44a06dc50f9767322262f8667a31fcb2";

export default node;
