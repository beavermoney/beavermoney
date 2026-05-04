/**
 * @generated SignedSource<<3318abb48e3baaddb46b760b6546872a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type routeHouseholdIdQuery$variables = {
  viewUserIds?: ReadonlyArray<string> | null | undefined;
};
export type routeHouseholdIdQuery$data = {
  readonly household: {
    readonly householdCurrencies: ReadonlyArray<{
      readonly code: string;
      readonly id: string;
      readonly important: boolean;
    }> | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"logTransactionFragment" | "snapshotDialogFragment" | "useDisplayCurrencyFragment" | "useHouseholdFragment" | "viewScopeSwitcherFragment">;
  };
  readonly user: {
    readonly " $fragmentSpreads": FragmentRefs<"useUserFragment">;
  };
  readonly userHousehold: {
    readonly " $fragmentSpreads": FragmentRefs<"useUserHouseholdFragment">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"appSidebarFragment">;
};
export type routeHouseholdIdQuery = {
  response: routeHouseholdIdQuery$data;
  variables: routeHouseholdIdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "viewUserIds"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "viewUserIds",
    "variableName": "viewUserIds"
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
  "name": "important",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = [
  (v2/*: any*/),
  (v5/*: any*/)
],
v7 = [
  (v4/*: any*/),
  (v2/*: any*/)
],
v8 = {
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
    "name": "routeHouseholdIdQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "appSidebarFragment"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useUserFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserHousehold",
        "kind": "LinkedField",
        "name": "userHousehold",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useUserHouseholdFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useHouseholdFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useDisplayCurrencyFragment"
          },
          {
            "args": (v1/*: any*/),
            "kind": "FragmentSpread",
            "name": "logTransactionFragment"
          },
          {
            "args": (v1/*: any*/),
            "kind": "FragmentSpread",
            "name": "snapshotDialogFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "viewScopeSwitcherFragment"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "HouseholdCurrency",
            "kind": "LinkedField",
            "name": "householdCurrencies",
            "plural": true,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
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
    "name": "routeHouseholdIdQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "households",
        "plural": true,
        "selections": (v6/*: any*/),
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
          (v5/*: any*/),
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserHousehold",
        "kind": "LinkedField",
        "name": "userHousehold",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "role",
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
              (v2/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Household",
        "kind": "LinkedField",
        "name": "household",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "locale",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "HouseholdCurrency",
            "kind": "LinkedField",
            "name": "householdCurrencies",
            "plural": true,
            "selections": [
              (v2/*: any*/),
              (v4/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "HouseholdRate",
            "kind": "LinkedField",
            "name": "householdRates",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "HouseholdCurrency",
                "kind": "LinkedField",
                "name": "fromCurrency",
                "plural": false,
                "selections": (v7/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "HouseholdCurrency",
                "kind": "LinkedField",
                "name": "toCurrency",
                "plural": false,
                "selections": (v7/*: any*/),
                "storageKey": null
              },
              (v2/*: any*/)
            ],
            "storageKey": null
          },
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
                      (v2/*: any*/),
                      (v5/*: any*/),
                      (v8/*: any*/),
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
                        "selections": (v7/*: any*/),
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
                          (v2/*: any*/),
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "symbol",
                            "storageKey": null
                          },
                          (v8/*: any*/)
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
                      (v2/*: any*/),
                      (v5/*: any*/),
                      (v8/*: any*/)
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
            "concreteType": "UserHousehold",
            "kind": "LinkedField",
            "name": "userHouseholds",
            "plural": true,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": (v6/*: any*/),
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
    "cacheID": "ef7c588964298476ee0a6c504bc277fa",
    "id": null,
    "metadata": {},
    "name": "routeHouseholdIdQuery",
    "operationKind": "query",
    "text": "query routeHouseholdIdQuery(\n  $viewUserIds: [ID!]\n) {\n  ...appSidebarFragment\n  user {\n    ...useUserFragment\n    id\n  }\n  userHousehold {\n    ...useUserHouseholdFragment\n    id\n  }\n  household {\n    ...useHouseholdFragment\n    ...useDisplayCurrencyFragment\n    ...logTransactionFragment_3rIbPZ\n    ...snapshotDialogFragment_3rIbPZ\n    ...viewScopeSwitcherFragment\n    householdCurrencies {\n      id\n      important\n      code\n    }\n    id\n  }\n}\n\nfragment appSidebarFragment on Query {\n  ...householdSwitcherFragment\n  ...navUserFragment\n}\n\nfragment householdSwitcherFragment on Query {\n  households {\n    id\n    name\n  }\n}\n\nfragment logTransactionFragment_3rIbPZ on Household {\n  ...newExpenseFragment_3rIbPZ\n  ...newIncomeFragment_3rIbPZ\n  ...newTransferFragment_3rIbPZ\n  ...newBuyFragment_3rIbPZ\n  ...newSellFragment_3rIbPZ\n  ...newMoveFragment_3rIbPZ\n}\n\nfragment navUserFragment on Query {\n  user {\n    name\n    id\n  }\n}\n\nfragment newBuyFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newExpenseFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newIncomeFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newMoveFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newSellFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newTransferFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        householdCurrency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment snapshotDialogFragment_3rIbPZ on Household {\n  accounts(where: {archived: false, userIDIn: $viewUserIds}) {\n    edges {\n      node {\n        type\n        value\n        householdCurrency {\n          code\n          id\n        }\n        id\n      }\n    }\n  }\n}\n\nfragment useDisplayCurrencyFragment on Household {\n  householdCurrencies {\n    id\n    important\n    code\n  }\n  householdRates {\n    rate\n    fromCurrency {\n      code\n      id\n    }\n    toCurrency {\n      code\n      id\n    }\n    id\n  }\n}\n\nfragment useHouseholdFragment on Household {\n  id\n  name\n  locale\n  householdCurrencies {\n    id\n    code\n  }\n}\n\nfragment useUserFragment on User {\n  id\n  name\n  email\n}\n\nfragment useUserHouseholdFragment on UserHousehold {\n  id\n  role\n  householdCurrency {\n    id\n    code\n  }\n}\n\nfragment viewScopeSwitcherFragment on Household {\n  userHouseholds {\n    id\n    user {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "90ea45af767d2825831721edc16f5ef3";

export default node;
