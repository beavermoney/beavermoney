/**
 * @generated SignedSource<<c8a15483276674cd7989db13e51e5886>>
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
export type accountSettingsFragment$data = {
  readonly accounts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly archived: boolean;
        readonly householdCurrency: {
          readonly code: string;
        };
        readonly icon: string | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly type: AccountType;
        readonly user: {
          readonly name: string;
        };
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly investments: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly account: {
          readonly archived: boolean;
          readonly icon: string | null | undefined;
          readonly name: string;
          readonly user: {
            readonly name: string;
          };
        };
        readonly archived: boolean;
        readonly id: string;
        readonly name: string;
        readonly symbol: string;
        readonly type: InvestmentType;
        readonly " $fragmentSpreads": FragmentRefs<"investmentArchiveActionFragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "accountSettingsFragment";
};
export type accountSettingsFragment$key = {
  readonly " $data"?: accountSettingsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"accountSettingsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "where",
    "value": {
      "archived": true
    }
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "archived",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "accountSettingsFragment",
  "selections": [
    {
      "alias": null,
      "args": (v0/*: any*/),
      "concreteType": "InvestmentConnection",
      "kind": "LinkedField",
      "name": "investments",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "InvestmentEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Investment",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "symbol",
                  "storageKey": null
                },
                (v3/*: any*/),
                (v4/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Account",
                  "kind": "LinkedField",
                  "name": "account",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    (v5/*: any*/),
                    (v4/*: any*/),
                    (v6/*: any*/)
                  ],
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "investmentArchiveActionFragment"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "investments(where:{\"archived\":true})"
    },
    {
      "alias": null,
      "args": (v0/*: any*/),
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
                (v1/*: any*/),
                (v2/*: any*/),
                (v5/*: any*/),
                (v3/*: any*/),
                (v4/*: any*/),
                (v6/*: any*/),
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
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "accounts(where:{\"archived\":true})"
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "3f393b49121dbebe201eb0ab169c9480";

export default node;
