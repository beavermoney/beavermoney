/**
 * @generated SignedSource<<803f23582b78435f5170c0421ed879a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from 'relay-runtime';
export type InvestmentType = "crypto" | "stock" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type transactionInvestmentPickerFragment$data = {
  readonly latestTransaction: {
    readonly datetime: any;
  } | null | undefined;
  readonly name: string;
  readonly symbol: string;
  readonly type: InvestmentType;
  readonly " $fragmentType": "transactionInvestmentPickerFragment";
};
export type transactionInvestmentPickerFragment$key = {
  readonly " $data"?: transactionInvestmentPickerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionInvestmentPickerFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "transactionInvestmentPickerFragment"
};

(node as any).hash = "13587105ed7f9edf89c778fe9f80bc03";

export default node;
