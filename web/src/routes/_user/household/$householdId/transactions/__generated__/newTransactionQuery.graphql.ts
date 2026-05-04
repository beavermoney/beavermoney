/**
 * @generated SignedSource<<ccabc862b7590bae9d00be41dba50e72>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type newTransactionQuery$variables = {
  viewUserIds?: ReadonlyArray<string> | null | undefined;
};
export type newTransactionQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"logTransactionFragment">;
  };
};
export type newTransactionQuery = {
  response: newTransactionQuery$data;
  variables: newTransactionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "viewUserIds"
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "newTransactionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "viewUserIds",
                "variableName": "viewUserIds"
              }
            ],
            "kind": "FragmentSpread",
            "name": "logTransactionFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newTransactionQuery",
    "selections": [
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
                      (v1/*: any*/),
                      (v2/*: any*/),
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "icon",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "value",
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
                          },
                          (v1/*: any*/)
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
                          (v1/*: any*/),
                          (v2/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "symbol",
                            "storageKey": null
                          },
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
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TransactionCategoryConnection",
            "kind": "LinkedField",
            "name": "transactionCategories",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionCategoryEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TransactionCategory",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      (v2/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0e6d161271701b9a41bfef4a65071c39",
    "id": null,
    "metadata": {},
    "name": "newTransactionQuery",
    "operationKind": "query",
    "text": "query newTransactionQuery(\n  $viewUserIds: [ID!]\n) {\n  household {\n    ...logTransactionFragment_3rIbPZ\n    id\n  }\n}\n\nfragment logTransactionFragment_3rIbPZ on Household {\n  ...newExpenseFragment_3rIbPZ\n  ...newIncomeFragment_3rIbPZ\n  ...newTransferFragment_3rIbPZ\n  ...newBuyFragment_3rIbPZ\n  ...newSellFragment_3rIbPZ\n  ...newMoveFragment_3rIbPZ\n}\n\nfragment newBuyFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newExpenseFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newIncomeFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newMoveFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newSellFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newTransferFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b1f5c622cc6117a359405fc74b20093b";

export default node;
