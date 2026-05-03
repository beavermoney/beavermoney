/**
 * @generated SignedSource<<7d43a41d3f04c7f8e60bf7dc90f2ca11>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type generalSettingsHouseholdFragment$data = {
  readonly id: string;
  readonly locale: string;
  readonly name: string;
  readonly " $fragmentType": "generalSettingsHouseholdFragment";
};
export type generalSettingsHouseholdFragment$key = {
  readonly " $data"?: generalSettingsHouseholdFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"generalSettingsHouseholdFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "generalSettingsHouseholdFragment",
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
      "name": "locale",
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};

(node as any).hash = "984cb71d6c2be966a0b0a4ed427f120e";

export default node;
