/**
 * @generated SignedSource<<cc36deec7dd0769e511df830a10f76aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type AccountIdLayoutFragment$data = {
  readonly archived: boolean;
  readonly id: string;
  readonly type: AccountType;
  readonly " $fragmentType": "AccountIdLayoutFragment";
};
export type AccountIdLayoutFragment$key = {
  readonly " $data"?: AccountIdLayoutFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AccountIdLayoutFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AccountIdLayoutFragment",
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
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "archived",
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};

(node as any).hash = "43e53cea19d49c904cb12558b88ab1e5";

export default node;
