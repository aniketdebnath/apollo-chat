import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  fromPromise,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { WS_URL } from "./urls";
import { excludedRoutes } from "./excluded-routes";
import { onLogout } from "../utils/logout";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { Chat, User } from "../gql/graphql";
import { sortChats } from "../utils/chat-sorting";
import { refreshAccessToken } from "../utils/refreshToken";
import { getRelativeApiUrl } from "../utils/api-url";
import { snackVar } from "./snack";
import { DEMO_ERROR_SNACK_MESSAGE } from "./error";

// Function to get the token from localStorage
const getToken = () => localStorage.getItem("token") || "";

// Debug link for critical errors only
const debugLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message }) => {
        if (
          message.includes(
            'Variable "$skip" of required type "Int!" was not provided'
          )
        ) {
          // Only log critical errors in production
          if (process.env.NODE_ENV !== "production") {
            
          }
        }
      });
    }

    return forward(operation);
  }
);

// Enhanced error handling with token refresh
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // Check for demo restriction errors
    const demoError = graphQLErrors?.find((error) =>
      error.message.includes("Demo account is read-only")
    );

    if (demoError) {
      // Show alert for demo restrictions
      snackVar(DEMO_ERROR_SNACK_MESSAGE);
      return forward(operation);
    }

    // Check if we have authentication errors
    const authError = graphQLErrors?.find(
      (error) =>
        error.extensions?.code === "UNAUTHENTICATED" ||
        (error.extensions?.originalError as any)?.statusCode === 401
    );

    // If on login page or other excluded routes, don't try to refresh
    if (
      excludedRoutes.some((route) => window.location.pathname.includes(route))
    ) {
      return forward(operation);
    }

    // If we have an auth error, try to refresh the token
    if (authError) {
      // Use fromPromise for token refresh
      return fromPromise(refreshAccessToken()).flatMap((success) => {
        if (success) {
          // Retry the failed request
          return forward(operation);
        } else {
          // If refresh failed, logout
          onLogout();
          return forward(operation);
        }
      });
    }

    // For non-auth errors, just pass through
    return forward(operation);
  }
);

const httpLink = new HttpLink({
  uri: getRelativeApiUrl("/graphql"),
  credentials: "include", // Important: include cookies with every request
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${WS_URL}/graphql`,
    connectionParams: {
      Authorization: `Bearer ${getToken()}`,
    },
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
            merge(_, incoming) {
              // Simplified merge logic - just sort the incoming chats
              return sortChats(incoming);
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
      User: {
        fields: {
          status: {
            // Always use the latest status value from the server
            merge: (_, incoming) => incoming,
          },
        },
      },
    },
  }),
  link: debugLink.concat(errorLink.concat(splitLink)),
});

export default client;

