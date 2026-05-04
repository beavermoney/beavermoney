/**
 * @generated SignedSource<<44e657bb52e62ea7765c1f366f978228>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
export type CreateTransactionCategoryInput = {
  icon: string;
  name: string;
  type: TransactionCategoryType;
};
export type newCategoryMutation$variables = {
  input: CreateTransactionCategoryInput;
};
export type newCategoryMutation$data = {
  readonly createTransactionCategory: {
    readonly node: {
      readonly id: string;
      readonly name: string;
      readonly type: TransactionCategoryType;
    } | null | undefined;
  };
};
export type newCategoryMutation = {
  response: newCategoryMutation$data;
  variables: newCategoryMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "TransactionCategoryEdge",
    "kind": "LinkedField",
    "name": "createTransactionCategory",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionCategory",
        "kind": "LinkedField",
        "name": "node",
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
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "type",
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
    "name": "newCategoryMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newCategoryMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "281613658fff8e3581d6e82e00361788",
    "id": null,
    "metadata": {},
    "name": "newCategoryMutation",
    "operationKind": "mutation",
    "text": "mutation newCategoryMutation(\n  $input: CreateTransactionCategoryInput!\n) {\n  createTransactionCategory(input: $input) {\n    node {\n      id\n      name\n      type\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6da5ae6877a4952b0e706a6e6bda36e";

export default node;
