/**
 * @generated SignedSource<<b48bc12094062115eed3615efb5880e1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionInvestmentPickerFragment$data = {
  readonly latestTransaction: {
    readonly datetime: any;
  } | null | undefined;
  readonly name: string;
  readonly symbol: string;
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

(node as any).hash = "b73aa2163ba04b6b23a509967c8a40b6";

export default node;
