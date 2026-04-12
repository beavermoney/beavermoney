/**
 * @generated SignedSource<<c7c41f73b3150416a898b9b811bb8141>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type generalSettingsHouseholdFragment$data = {
  readonly currencyCode: string;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "currencyCode",
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};

(node as any).hash = "12d0e415d625e6c11824b1e1657817bc";

export default node;
