/**
 * @generated SignedSource<<741184d0196e3c899243e842112c20f8>>
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
  "name": "type",
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
  "name": "icon",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "Transaction",
  "kind": "LinkedField",
  "name": "latestTransaction",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "datetime",
      "storageKey": null
    },
    (v1/*: any*/)
  ],
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
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "balance",
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
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "user",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v1/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Investment",
                        "kind": "LinkedField",
                        "name": "investments",
                        "plural": true,
                        "selections": [
                          (v1/*: any*/),
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "symbol",
                            "storageKey": null
                          },
                          (v2/*: any*/),
                          (v5/*: any*/)
                        ],
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
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/)
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
    "cacheID": "137bf23566a3061f2a301eb06486f3df",
    "id": null,
    "metadata": {},
    "name": "newTransactionQuery",
    "operationKind": "query",
    "text": "query newTransactionQuery(\n  $viewUserIds: [ID!]\n) {\n  household {\n    ...logTransactionFragment_3rIbPZ\n    id\n  }\n}\n\nfragment logTransactionFragment_3rIbPZ on Household {\n  ...newExpenseFragment_3rIbPZ\n  ...newIncomeFragment_3rIbPZ\n  ...newTransferFragment_3rIbPZ\n  ...newBuyFragment_3rIbPZ\n  ...newSellFragment_3rIbPZ\n  ...newMoveFragment_3rIbPZ\n}\n\nfragment newBuyFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        type\n        ...transactionAccountPickerFragment\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          ...transactionInvestmentPickerFragment\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newExpenseFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        type\n        ...transactionAccountPickerFragment\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        type\n        ...transactionCategoryPickerFragment\n      }\n    }\n  }\n}\n\nfragment newIncomeFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        type\n        ...transactionAccountPickerFragment\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        type\n        ...transactionCategoryPickerFragment\n      }\n    }\n  }\n}\n\nfragment newMoveFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          symbol\n          ...transactionInvestmentPickerFragment\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newSellFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        type\n        ...transactionAccountPickerFragment\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          ...transactionInvestmentPickerFragment\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newTransferFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        type\n        ...transactionAccountPickerFragment\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        type\n        ...transactionCategoryPickerFragment\n      }\n    }\n  }\n}\n\nfragment transactionAccountPickerFragment on Account {\n  id\n  type\n  name\n  icon\n  balance\n  householdCurrency {\n    code\n    id\n  }\n  user {\n    name\n    id\n  }\n  latestTransaction {\n    datetime\n    id\n  }\n}\n\nfragment transactionCategoryPickerFragment on TransactionCategory {\n  name\n  icon\n  latestTransaction {\n    datetime\n    id\n  }\n}\n\nfragment transactionInvestmentPickerFragment on Investment {\n  name\n  symbol\n  type\n  latestTransaction {\n    datetime\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b1f5c622cc6117a359405fc74b20093b";

export default node;
