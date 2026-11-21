/**
 * @generated SignedSource<<59e0dd2d4c2bbc702cead9c17d4b2da4>>
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
  readonly amount: string;
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

(node as any).hash = "632caa0ec6bc1a974412ac20829647cb";

export default node;
