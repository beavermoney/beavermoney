/**
 * @generated SignedSource<<2a59053e793b310f0bb3e31173beee0e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type UserHouseholdRole = "admin" | "member" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type membersSettingsFragment$data = {
  readonly userHouseholds: ReadonlyArray<{
    readonly defaultCurrency: {
      readonly code: string;
    } | null | undefined;
    readonly id: string;
    readonly role: UserHouseholdRole;
    readonly user: {
      readonly email: string;
      readonly id: string;
      readonly name: string;
    };
  }> | null | undefined;
  readonly " $fragmentType": "membersSettingsFragment";
};
export type membersSettingsFragment$key = {
  readonly " $data"?: membersSettingsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"membersSettingsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "membersSettingsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "UserHousehold",
      "kind": "LinkedField",
      "name": "userHouseholds",
      "plural": true,
      "selections": [
        (v0/*: any*/),
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
          "concreteType": "HouseholdCurrency",
          "kind": "LinkedField",
          "name": "defaultCurrency",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "code",
              "storageKey": null
            }
          ],
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
            (v0/*: any*/),
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
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "3c2c86b5575cb64c09a969fd3d6f6c13";

export default node;
