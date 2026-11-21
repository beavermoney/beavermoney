/**
 * @generated SignedSource<<4d90a3f612be4c97dc5e93415f8edc94>>
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

(node as any).hash = "4c24fcd73398f4f734844a8ba536e7e3";

export default node;
