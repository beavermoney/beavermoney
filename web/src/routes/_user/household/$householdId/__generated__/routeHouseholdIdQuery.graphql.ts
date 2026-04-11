/**
 * @generated SignedSource<<e4cd22bbba7ede25d72825b47e3dc4aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type routeHouseholdIdQuery$variables = Record<PropertyKey, never>;
export type routeHouseholdIdQuery$data = {
  readonly household: {
    readonly " $fragmentSpreads": FragmentRefs<"logTransactionFragment" | "snapshotDialogFragment" | "useHouseholdFragment">;
  };
  readonly user: {
    readonly " $fragmentSpreads": FragmentRefs<"useUserFragment">;
  };
  readonly " $fragmentSpreads": FragmentRefs<"appSidebarFragment">;
};
export type routeHouseholdIdQuery = {
  response: routeHouseholdIdQuery$data;
  variables: routeHouseholdIdQuery$variables;
};

const node: ConcreteRequest = (function(){
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
  "name": "code",
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
    "argumentDefinitions": [],
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
            "name": "logTransactionFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "snapshotDialogFragment"
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
    "argumentDefinitions": [],
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
        "selections": [
          (v0/*: any*/),
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
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          },
          (v0/*: any*/)
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
          (v0/*: any*/),
          (v1/*: any*/),
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
            "concreteType": "Currency",
            "kind": "LinkedField",
            "name": "currency",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "where",
                "value": {
                  "archived": false
                }
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
                        "concreteType": "Currency",
                        "kind": "LinkedField",
                        "name": "currency",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v0/*: any*/)
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
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "valueInHouseholdCurrency",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "accounts(where:{\"archived\":false})"
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
                      (v0/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "c6b74ce0edce3f4f20dfa73dfeec6d38",
    "id": null,
    "metadata": {},
    "name": "routeHouseholdIdQuery",
    "operationKind": "query",
    "text": "query routeHouseholdIdQuery {\n  ...appSidebarFragment\n  user {\n    ...useUserFragment\n    id\n  }\n  household {\n    ...useHouseholdFragment\n    ...logTransactionFragment\n    ...snapshotDialogFragment\n    id\n  }\n}\n\nfragment appSidebarFragment on Query {\n  ...householdSwitcherFragment\n  ...navUserFragment\n}\n\nfragment householdSwitcherFragment on Query {\n  households {\n    id\n    name\n  }\n}\n\nfragment logTransactionFragment on Household {\n  ...newExpenseFragment\n  ...newIncomeFragment\n  ...newTransferFragment\n  ...newBuyFragment\n  ...newSellFragment\n  ...newMoveFragment\n}\n\nfragment navUserFragment on Query {\n  user {\n    name\n    email\n    id\n  }\n}\n\nfragment newBuyFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        currency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newExpenseFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        currency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newIncomeFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        currency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newMoveFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        type\n        value\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newSellFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        currency {\n          code\n          id\n        }\n        investments {\n          id\n          name\n          symbol\n          type\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment newTransferFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        id\n        name\n        type\n        icon\n        value\n        currency {\n          code\n          id\n        }\n      }\n    }\n  }\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment snapshotDialogFragment on Household {\n  accounts(where: {archived: false}) {\n    edges {\n      node {\n        type\n        valueInHouseholdCurrency\n        id\n      }\n    }\n  }\n}\n\nfragment useHouseholdFragment on Household {\n  id\n  name\n  locale\n  currency {\n    id\n    code\n  }\n}\n\nfragment useUserFragment on User {\n  id\n  name\n  email\n}\n"
  }
};
})();

(node as any).hash = "78105f27bf24943da82f5483c06f187e";

export default node;
