/**
 * @generated SignedSource<<4b2dc719d12fb353aa542bb8a76dc3e5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type averageCostEditorMutation$variables = {
  average: string;
  expectedAmount: string;
  expectedChangedAt?: any | null | undefined;
  id: string;
};
export type averageCostEditorMutation$data = {
  readonly confirmInvestmentAverage: {
    readonly averageCost: string | null | undefined;
    readonly averageCostConfirmedAt: any | null | undefined;
    readonly averageNeedsReview: boolean;
    readonly confirmedAverageCost: string | null | undefined;
    readonly costBasis: string | null | undefined;
    readonly id: string;
    readonly unrealizedReturn: string | null | undefined;
    readonly unrealizedReturnPercent: string | null | undefined;
  };
};
export type averageCostEditorMutation = {
  response: averageCostEditorMutation$data;
  variables: averageCostEditorMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "average"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "expectedAmount"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "expectedChangedAt"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "average",
        "variableName": "average"
      },
      {
        "kind": "Variable",
        "name": "expectedAmount",
        "variableName": "expectedAmount"
      },
      {
        "kind": "Variable",
        "name": "expectedChangedAt",
        "variableName": "expectedChangedAt"
      },
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "Investment",
    "kind": "LinkedField",
    "name": "confirmInvestmentAverage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "confirmedAverageCost",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "averageCostConfirmedAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "averageNeedsReview",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "costBasis",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "averageCost",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "unrealizedReturn",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "unrealizedReturnPercent",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "averageCostEditorMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "averageCostEditorMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "09752957e509376dc6ee39c8286df88f",
    "id": null,
    "metadata": {},
    "name": "averageCostEditorMutation",
    "operationKind": "mutation",
    "text": "mutation averageCostEditorMutation(\n  $id: ID!\n  $average: String!\n  $expectedAmount: String!\n  $expectedChangedAt: Time\n) {\n  confirmInvestmentAverage(id: $id, average: $average, expectedAmount: $expectedAmount, expectedChangedAt: $expectedChangedAt) {\n    id\n    confirmedAverageCost\n    averageCostConfirmedAt\n    averageNeedsReview\n    costBasis\n    averageCost\n    unrealizedReturn\n    unrealizedReturnPercent\n  }\n}\n"
  }
};
})();

(node as any).hash = "bea36a6e607368b9c3a1179350ca1299";

export default node;
