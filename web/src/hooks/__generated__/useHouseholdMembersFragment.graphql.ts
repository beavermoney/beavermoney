/**
 * @generated SignedSource<<3e51803cc47946aa9c3d079b6abf8af6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useHouseholdMembersFragment$data = {
  readonly userHouseholds: ReadonlyArray<{
    readonly id: string;
    readonly user: {
      readonly id: string;
      readonly isSynthetic: boolean;
      readonly name: string;
    };
  }> | null | undefined;
  readonly " $fragmentType": "useHouseholdMembersFragment";
};
export type useHouseholdMembersFragment$key = {
  readonly " $data"?: useHouseholdMembersFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useHouseholdMembersFragment">;
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
  "name": "useHouseholdMembersFragment",
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
              "name": "isSynthetic",
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

(node as any).hash = "a6b3ef78fd3ed72e842b3d5e6b88a3ea";

export default node;
