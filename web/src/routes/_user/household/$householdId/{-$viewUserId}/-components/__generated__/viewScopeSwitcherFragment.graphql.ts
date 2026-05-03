/**
 * @generated SignedSource<<8801dbc7551dc05d83d63fdb77ea50a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type viewScopeSwitcherFragment$data = {
  readonly userHouseholds: ReadonlyArray<{
    readonly id: string;
    readonly user: {
      readonly id: string;
      readonly name: string;
    };
  }> | null | undefined;
  readonly " $fragmentType": "viewScopeSwitcherFragment";
};
export type viewScopeSwitcherFragment$key = {
  readonly " $data"?: viewScopeSwitcherFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"viewScopeSwitcherFragment">;
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
  "name": "viewScopeSwitcherFragment",
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

(node as any).hash = "f7466880e7c5ce7526441e8c105556d8";

export default node;
