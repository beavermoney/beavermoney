/**
 * @generated SignedSource<<e30e906242cbe33078184eb1d8cf09c8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
export type UpdateTransactionCategoryInput = {
  addTransactionIDs?: ReadonlyArray<string> | null | undefined;
  clearTransactions?: boolean | null | undefined;
  icon?: string | null | undefined;
  isImmutable?: boolean | null | undefined;
  name?: string | null | undefined;
  removeTransactionIDs?: ReadonlyArray<string> | null | undefined;
};
export type editCategoryMutation$variables = {
  id: string;
  input: UpdateTransactionCategoryInput;
};
export type editCategoryMutation$data = {
  readonly updateTransactionCategory: {
    readonly node: {
      readonly icon: string;
      readonly id: string;
      readonly name: string;
      readonly type: TransactionCategoryType;
      readonly " $fragmentSpreads": FragmentRefs<"categoryCardCategoryFragment">;
    } | null | undefined;
  };
};
export type editCategoryMutation = {
  response: editCategoryMutation$data;
  variables: editCategoryMutation$variables;
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
v1 = [
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
  "name": "type",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editCategoryMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransactionCategoryEdge",
        "kind": "LinkedField",
        "name": "updateTransactionCategory",
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "categoryCardCategoryFragment"
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
    "name": "editCategoryMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransactionCategoryEdge",
        "kind": "LinkedField",
        "name": "updateTransactionCategory",
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9e721c3a0ac61df6d0f8470d0ceaa08c",
    "id": null,
    "metadata": {},
    "name": "editCategoryMutation",
    "operationKind": "mutation",
    "text": "mutation editCategoryMutation(\n  $id: ID!\n  $input: UpdateTransactionCategoryInput!\n) {\n  updateTransactionCategory(id: $id, input: $input) {\n    node {\n      id\n      name\n      type\n      icon\n      ...categoryCardCategoryFragment\n    }\n  }\n}\n\nfragment categoryCardCategoryFragment on TransactionCategory {\n  id\n  name\n  type\n  icon\n}\n"
  }
};
})();

(node as any).hash = "5885ceab14411b15eb26fdbba535382b";

export default node;
