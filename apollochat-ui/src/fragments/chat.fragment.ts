import { graphql } from "../gql";

export const ChatFragment = graphql(`
  fragment ChatFragment on Chat {
    _id
    name
    type
    isPinned
    latestMessage {
      ...MessageFragment
    }
    creator {
      ...UserFragment
    }
    members {
      ...UserFragment
    }
  }
`);
