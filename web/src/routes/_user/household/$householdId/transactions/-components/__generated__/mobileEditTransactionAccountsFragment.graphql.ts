/**
 * @generated SignedSource<<7c01ab3aa6dd203ab488d837714e5e77>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
export type InvestmentType = "crypto" | "stock" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type mobileEditTransactionAccountsFragment$data = {
  readonly accounts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly archived: boolean;
        readonly householdCurrency: {
          readonly code: string;
        };
        readonly icon: string | null | undefined;
        readonly id: string;
        readonly investments: ReadonlyArray<{
          readonly id: string;
          readonly name: string;
          readonly symbol: string;
          readonly type: InvestmentType;
        }> | null | undefined;
        readonly name: string;
        readonly type: AccountType;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "mobileEditTransactionAccountsFragment";
};
export type mobileEditTransactionAccountsFragment$key = {
  readonly " $data"?: mobileEditTransactionAccountsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"mobileEditTransactionAccountsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "viewUserIds"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "mobileEditTransactionAccountsFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "fields": [
            {
              "kind": "Literal",
              "name": "archived",
              "value": false
            },
            {
              "kind": "Variable",
              "name": "userIDIn",
              "variableName": "viewUserIds"
            }
          ],
          "kind": "ObjectValue",
          "name": "where"
        }
      ],
      "concreteType": "AccountConnection",
      "kind": "LinkedField",
      "name": "accounts",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "AccountEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Account",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "icon",
                  "storageKey": null
                },
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "archived",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "HouseholdCurrency",
                  "kind": "LinkedField",
                  "name": "householdCurrency",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "code",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Investment",
                  "kind": "LinkedField",
                  "name": "investments",
                  "plural": true,
                  "selections": [
                    (v0/*: any*/),
                    (v1/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "symbol",
                      "storageKey": null
                    },
                    (v2/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "0f570e9d8ed86c584f929554e0b92a97";

export default node;
