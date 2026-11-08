/**
 * @generated SignedSource<<e94835c6d720a00a932cf93b7cf4562d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type appSidebarFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"householdSwitcherFragment">;
  readonly " $fragmentType": "appSidebarFragment";
};
export type appSidebarFragment$key = {
  readonly " $data"?: appSidebarFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"appSidebarFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "appSidebarFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "householdSwitcherFragment"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "67fa8ac0a1894ae7110d8bb227a3b97e";

export default node;
