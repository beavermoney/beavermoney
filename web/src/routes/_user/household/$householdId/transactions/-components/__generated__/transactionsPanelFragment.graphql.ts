/**
 * @generated SignedSource<<c13ed9ec73543f60db171d01766afd0d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionsPanelFragment$data = {
  readonly household: {
    readonly financialReport: {
      readonly " $fragmentSpreads": FragmentRefs<"financialSummaryCardsFragment">;
    };
  };
  readonly " $fragmentSpreads": FragmentRefs<"transactionsListFragment">;
  readonly " $fragmentType": "transactionsPanelFragment";
};
export type transactionsPanelFragment$key = {
  readonly " $data"?: transactionsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionsPanelFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "endDate"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "startDate"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "where"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "transactionsPanelFragment",
  "selections": [
    {
      "args": [
        {
          "kind": "Variable",
          "name": "where",
          "variableName": "where"
        }
      ],
      "kind": "FragmentSpread",
      "name": "transactionsListFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Household",
      "kind": "LinkedField",
      "name": "household",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "fields": [
                {
                  "kind": "Variable",
                  "name": "endDate",
                  "variableName": "endDate"
                },
                {
                  "kind": "Variable",
                  "name": "startDate",
                  "variableName": "startDate"
                }
              ],
              "kind": "ObjectValue",
              "name": "period"
            }
          ],
          "concreteType": "FinancialReport",
          "kind": "LinkedField",
          "name": "financialReport",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "financialSummaryCardsFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "550b21ae67fbad006199693cf6077f36";

export default node;
