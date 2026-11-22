/**
 * @generated SignedSource<<cae19edd3f9bb23682be018c8f4c9c5b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type transactionDayTotalsFragment$data = {
  readonly category: {
    readonly type: TransactionCategoryType;
  };
  readonly excludeFromReports: boolean;
  readonly transactionEntries: ReadonlyArray<{
    readonly account: {
      readonly householdCurrency: {
        readonly code: string;
      };
      readonly user: {
        readonly id: string;
      };
    };
    readonly amount: string;
  }> | null | undefined;
  readonly " $fragmentType": "transactionDayTotalsFragment";
};
export type transactionDayTotalsFragment$key = {
  readonly " $data"?: transactionDayTotalsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionDayTotalsFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "transactionDayTotalsFragment"
};

(node as any).hash = "6c27303df1f40bdda61b4b4a8c777834";

export default node;
