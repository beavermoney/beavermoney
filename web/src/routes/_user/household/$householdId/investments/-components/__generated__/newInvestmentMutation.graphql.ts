/**
 * @generated SignedSource<<b7e4a91aa536038a959dd81449d46e3f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InvestmentType = "crypto" | "stock" | "%future added value";
export type CreateInvestmentInputCustom = {
  costBasis: string;
  input: CreateInvestmentInput;
};
export type CreateInvestmentInput = {
  accountID: string;
  amount?: string | null | undefined;
  name: string;
  symbol: string;
  type: InvestmentType;
};
export type newInvestmentMutation$variables = {
  input: CreateInvestmentInputCustom;
};
export type newInvestmentMutation$data = {
  readonly createInvestment: {
    readonly node: {
      readonly account: {
        readonly id: string;
        readonly name: string;
      };
      readonly id: string;
      readonly name: string;
      readonly valueInDisplayCurrency: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"investmentCardFragment">;
    } | null | undefined;
  };
};
export type newInvestmentMutation = {
  response: newInvestmentMutation$data;
  variables: newInvestmentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "valueInDisplayCurrency",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "Account",
  "kind": "LinkedField",
  "name": "account",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newInvestmentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "InvestmentEdge",
        "kind": "LinkedField",
        "name": "createInvestment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Investment",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "investmentCardFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newInvestmentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "InvestmentEdge",
        "kind": "LinkedField",
        "name": "createInvestment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Investment",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "symbol",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "quote",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "updateTime",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Currency",
                "kind": "LinkedField",
                "name": "currency",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "code",
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "amount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "value",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cfe38f471872db3b383c3142e557d66a",
    "id": null,
    "metadata": {},
    "name": "newInvestmentMutation",
    "operationKind": "mutation",
    "text": "mutation newInvestmentMutation(\n  $input: CreateInvestmentInputCustom!\n) {\n  createInvestment(input: $input) {\n    node {\n      id\n      name\n      valueInDisplayCurrency\n      account {\n        name\n        id\n      }\n      ...investmentCardFragment\n    }\n  }\n}\n\nfragment investmentCardFragment on Investment {\n  id\n  name\n  symbol\n  quote\n  updateTime\n  currency {\n    code\n    id\n  }\n  amount\n  value\n}\n"
  }
};
})();

(node as any).hash = "dfb3f9a5d238916d12bde9d56cd23de1";

export default node;
