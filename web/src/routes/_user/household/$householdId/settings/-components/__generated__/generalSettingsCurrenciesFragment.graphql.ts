/**
 * @generated SignedSource<<e453c7811c3993a76ac7f539a40d9328>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type UserHouseholdRole = "admin" | "member" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type generalSettingsCurrenciesFragment$data = {
  readonly userHouseholds: ReadonlyArray<{
    readonly role: UserHouseholdRole;
    readonly user: {
      readonly id: string;
    };
  }>;
  readonly " $fragmentType": "generalSettingsCurrenciesFragment";
};
export type generalSettingsCurrenciesFragment$key = {
  readonly " $data"?: generalSettingsCurrenciesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"generalSettingsCurrenciesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "generalSettingsCurrenciesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "UserHousehold",
      "kind": "LinkedField",
      "name": "userHouseholds",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "role",
          "storageKey": null
        },
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
              "name": "id",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "8a5beed7318475a346f4e277f66c9ee3";

export default node;
