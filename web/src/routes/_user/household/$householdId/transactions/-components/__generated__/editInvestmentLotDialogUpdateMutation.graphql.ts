/**
 * @generated SignedSource<<aa5a83531d70d429afd1d0abafa27854>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateInvestmentLotInput = {
  amount?: string | null | undefined;
  investmentID?: string | null | undefined;
  price?: string | null | undefined;
};
export type editInvestmentLotDialogUpdateMutation$variables = {
  id: string;
  input: UpdateInvestmentLotInput;
};
export type editInvestmentLotDialogUpdateMutation$data = {
  readonly updateInvestmentLot: {
    readonly node: {
      readonly amount: string;
      readonly id: string;
      readonly investment: {
        readonly account: {
          readonly id: string;
          readonly value: string;
        };
        readonly amount: string;
        readonly id: string;
        readonly value: string;
      };
      readonly investmentID: string;
      readonly price: string;
    } | null | undefined;
  };
};
export type editInvestmentLotDialogUpdateMutation = {
  response: editInvestmentLotDialogUpdateMutation$data;
  variables: editInvestmentLotDialogUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
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
  "name": "amount",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "InvestmentLotEdge",
    "kind": "LinkedField",
    "name": "updateInvestmentLot",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "InvestmentLot",
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
            "name": "price",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "investmentID",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Investment",
            "kind": "LinkedField",
            "name": "investment",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Account",
                "kind": "LinkedField",
                "name": "account",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v3/*: any*/)
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editInvestmentLotDialogUpdateMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editInvestmentLotDialogUpdateMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "f5bb50b439bb3e914e2e6389642fe764",
    "id": null,
    "metadata": {},
    "name": "editInvestmentLotDialogUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation editInvestmentLotDialogUpdateMutation(\n  $id: ID!\n  $input: UpdateInvestmentLotInput!\n) {\n  updateInvestmentLot(id: $id, input: $input) {\n    node {\n      id\n      amount\n      price\n      investmentID\n      investment {\n        id\n        amount\n        value\n        account {\n          id\n          value\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "404c7e93f5dafce079ceb9286c122fc6";

export default node;
