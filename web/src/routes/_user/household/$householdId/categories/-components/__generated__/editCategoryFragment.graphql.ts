/**
 * @generated SignedSource<<75e8f432ae0e83181585d23913f01c3c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type editCategoryFragment$data = {
  readonly icon: string;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "editCategoryFragment";
};
export type editCategoryFragment$key = {
  readonly " $data"?: editCategoryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editCategoryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editCategoryFragment",
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
  "type": "TransactionCategory",
  "abstractKey": null
};

(node as any).hash = "8565eb12d4bbb3c06164ed25b1a630df";

export default node;
