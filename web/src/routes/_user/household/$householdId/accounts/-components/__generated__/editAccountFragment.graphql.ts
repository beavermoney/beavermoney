/**
 * @generated SignedSource<<60363ec78a35a716bd21dc870cab4904>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type editAccountFragment$data = {
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly user: {
    readonly name: string;
  };
  readonly " $fragmentType": "editAccountFragment";
};
export type editAccountFragment$key = {
  readonly " $data"?: editAccountFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editAccountFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editAccountFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "icon",
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
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};
})();

(node as any).hash = "96b68ff35fe9eca11977feacc11a3a04";

export default node;
