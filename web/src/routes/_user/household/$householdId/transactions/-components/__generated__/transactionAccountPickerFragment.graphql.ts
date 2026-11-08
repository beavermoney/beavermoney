/**
 * @generated SignedSource<<93e88ae0ffacb76796dafdfaec11e8ed>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionAccountPickerFragment$data = {
  readonly balance: string;
  readonly householdCurrency: {
    readonly code: string;
  };
  readonly icon: string | null | undefined;
  readonly latestTransaction: {
    readonly datetime: any;
  } | null | undefined;
  readonly name: string;
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

(node as any).hash = "ac54cef0c4a7a4851900b2c7dc7853c1";

export default node;
