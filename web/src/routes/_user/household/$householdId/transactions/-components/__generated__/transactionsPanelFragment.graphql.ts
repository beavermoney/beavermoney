/**
 * @generated SignedSource<<2c51f975e6cb9e4e7901c85412111a98>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionsPanelFragment$data = {
  readonly financialReport: {
    readonly " $fragmentSpreads": FragmentRefs<"financialSummaryCardsFragment">;
  };
  readonly id: string;
  readonly " $fragmentSpreads": FragmentRefs<"transactionsListFragment">;
  readonly " $fragmentType": "transactionsPanelFragment";
};
export type transactionsPanelFragment$key = {
  readonly " $data"?: transactionsPanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionsPanelFragment">;
};

import transactionsPanelRefetchQuery_graphql from './transactionsPanelRefetchQuery.graphql';

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
      "name": "viewUserIds"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "where"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": transactionsPanelRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
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
        },
        {
          "kind": "Variable",
          "name": "viewUserIDs",
          "variableName": "viewUserIds"
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};

(node as any).hash = "21e2c62ae02ad0c5afe2290ef3429c0d";

export default node;
