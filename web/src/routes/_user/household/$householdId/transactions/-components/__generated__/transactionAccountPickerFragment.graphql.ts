/**
 * @generated SignedSource<<a1d97dd1b3f83eb210ff9b9eb9647d80>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from 'relay-runtime';
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type transactionAccountPickerFragment$data = {
  readonly balance: string;
  readonly householdCurrency: {
    readonly code: string;
  };
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly latestTransaction: {
    readonly datetime: any;
  } | null | undefined;
  readonly name: string;
  readonly type: AccountType;
  readonly user: {
    readonly name: string;
  };
  readonly " $fragmentType": "transactionAccountPickerFragment";
};
export type transactionAccountPickerFragment$key = {
  readonly " $data"?: transactionAccountPickerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionAccountPickerFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "transactionAccountPickerFragment"
};

(node as any).hash = "34fd491d25264c1b481064e409afc7e7";

export default node;
