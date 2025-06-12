import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { API_URL, WS_URL } from "./urls";
import { excludedRoutes } from "./excluded-routes";
import { onLogout } from "../utils/logout";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Super detailed debug link to identify the source of Variable $skip errors
const debugLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        if (
          message.includes(
            'Variable "$skip" of required type "Int!" was not provided'
          )
        ) {
          console.error(
            `%c[SKIP ERROR] in operation: ${operation.operationName}`,
            "background: #ff0000; color: white; padding: 2px;"
          );
          console.error("Variables:", JSON.stringify(operation.variables));
          console.error("Query:", operation.query.loc?.source.body);
          console.error("Stack trace:", new Error().stack);
        }
      });
    }
    return forward(operation);
  }
);

const logoutLink = onError((error) => {
  if (
    error.graphQLErrors?.length &&
    (error.graphQLErrors[0].extensions?.originalError as any)?.statusCode ===
      401
  ) {
    if (!excludedRoutes.includes(window.location.pathname)) {
      onLogout();
    }
  }
});

const httpLink = new HttpLink({ uri: `${API_URL}/graphql` });

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${WS_URL}/graphql`,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            keyArgs: false,
            merge(existing, incoming, { args }) {
              if (args?.limit >= 1000) {
                return incoming;
              }

              const merged = existing ? existing.slice(0) : [];
              if (args?.skip !== undefined) {
                for (let i = 0; i < incoming.length; ++i) {
                  merged[args.skip + i] = incoming[i];
                }
                return merged;
              }

              return incoming;
            },
          },
          messages: {
            keyArgs: ["chatId"],
            merge(existing, incoming, { args }) {
              const merged = existing ? existing.slice(0) : [];
              if (args?.skip !== undefined) {
                for (let i = 0; i < incoming.length; ++i) {
                  merged[args.skip + i] = incoming[i];
                }
                return merged;
              }
              return incoming;
            },
          },
        },
      },
    },
  }),
  link: debugLink.concat(logoutLink.concat(splitLink)),
});

export default client;
