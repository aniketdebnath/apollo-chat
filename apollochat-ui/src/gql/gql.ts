/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  fragment ChatFragment on Chat {\n    _id\n    name\n    type\n    isPinned\n    latestMessage {\n      ...MessageFragment\n    }\n    creator {\n      ...UserFragment\n    }\n    members {\n      ...UserFragment\n    }\n  }\n": types.ChatFragmentFragmentDoc,
    "\n  fragment MessageFragment on Message {\n    _id\n    content\n    createdAt\n    chatId\n    user {\n      ...UserFragment\n    }\n  }\n": types.MessageFragmentFragmentDoc,
    "\n  fragment UserFragment on User {\n    _id\n    email\n    username\n    imageUrl\n    status\n  }\n": types.UserFragmentFragmentDoc,
    "\n  mutation AddChatMember($chatMemberInput: ChatMemberInput!) {\n    addChatMember(chatMemberInput: $chatMemberInput) {\n      _id\n      name\n      members {\n        _id\n        username\n        imageUrl\n        status\n      }\n    }\n  }\n": types.AddChatMemberDocument,
    "\n  mutation BanChatUser($chatBanInput: ChatBanInput!) {\n    banChatUser(chatBanInput: $chatBanInput) {\n      _id\n      name\n      members {\n        ...UserFragment\n      }\n    }\n  }\n": types.BanChatUserDocument,
    "\n  subscription ChatAdded {\n    chatAdded {\n      ...ChatFragment\n    }\n  }\n": types.ChatAddedDocument,
    "\n  subscription ChatDeleted {\n    chatDeleted {\n      _id\n    }\n  }\n": types.ChatDeletedDocument,
    "\n  mutation CreateChat($createChatInput: CreateChatInput!) {\n    createChat(createChatInput: $createChatInput) {\n      ...ChatFragment\n    }\n  }\n": types.CreateChatDocument,
    "\n  mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n    createMessage(createMessageInput: $createMessageInput) {\n      ...MessageFragment\n    }\n  }\n": types.CreateMessageDocument,
    "\n  mutation CreateUser($createUserInput: CreateUserInput!) {\n    createUser(createUserInput: $createUserInput) {\n      _id\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation RemoveChat($chatId: String!) {\n    removeChat(chatId: $chatId) {\n      _id\n    }\n  }\n": types.RemoveChatDocument,
    "\n  query ChatBannedUsers($chatId: String!) {\n    chatBannedUsers(chatId: $chatId) {\n      user {\n        _id\n        username\n        imageUrl\n      }\n      until\n      reason\n    }\n  }\n": types.ChatBannedUsersDocument,
    "\n  query Chat($_id: String!) {\n    chat(_id: $_id) {\n      ...ChatFragment\n    }\n  }\n": types.ChatDocument,
    "\n  query Chats($skip: Int!, $limit: Int!) {\n    chats(skip: $skip, limit: $limit) {\n      ...ChatFragment\n    }\n  }\n": types.ChatsDocument,
    "\n  query Me {\n    me {\n      ...UserFragment\n    }\n  }\n": types.MeDocument,
    "\n  query Messages($chatId: String!, $skip: Int!, $limit: Int!) {\n    messages(chatId: $chatId, skip: $skip, limit: $limit) {\n      ...MessageFragment\n    }\n  }\n": types.MessagesDocument,
    "\n  query GetPublicChats {\n    publicChats {\n      ...ChatFragment\n    }\n  }\n": types.GetPublicChatsDocument,
    "\n  mutation JoinChat($chatId: String!) {\n    joinChat(chatId: $chatId) {\n      ...ChatFragment\n    }\n  }\n": types.JoinChatDocument,
    "\n  subscription messageCreated($chatIds: [String!]!) {\n    messageCreated(chatIds: $chatIds) {\n      ...MessageFragment\n    }\n  }\n": types.MessageCreatedDocument,
    "\n  mutation PinChat($chatPinInput: ChatPinInput!) {\n    pinChat(chatPinInput: $chatPinInput) {\n      _id\n      name\n      isPinned\n    }\n  }\n": types.PinChatDocument,
    "\n  mutation RemoveChatMember($chatMemberInput: ChatMemberInput!) {\n    removeChatMember(chatMemberInput: $chatMemberInput) {\n      _id\n      name\n      members {\n        ...UserFragment\n      }\n    }\n  }\n": types.RemoveChatMemberDocument,
    "\n  query SearchUsers($searchTerm: String!, $limit: Int) {\n    searchUsers(searchTerm: $searchTerm, limit: $limit) {\n      ...UserFragment\n    }\n  }\n": types.SearchUsersDocument,
    "\n  mutation UnbanChatUser($chatUnbanInput: ChatUnbanInput!) {\n    unbanChatUser(chatUnbanInput: $chatUnbanInput) {\n      _id\n      name\n      bannedUsers {\n        user {\n          ...UserFragment\n        }\n        until\n        reason\n      }\n    }\n  }\n": types.UnbanChatUserDocument,
    "\n  mutation UnpinChat($chatPinInput: ChatPinInput!) {\n    unpinChat(chatPinInput: $chatPinInput) {\n      _id\n      name\n      isPinned\n    }\n  }\n": types.UnpinChatDocument,
    "\n  mutation UpdateChat($updateChatInput: UpdateChatInput!) {\n    updateChat(updateChatInput: $updateChatInput) {\n      _id\n      name\n      type\n      creator {\n        _id\n        username\n      }\n    }\n  }\n": types.UpdateChatDocument,
    "\n  mutation UpdateUserStatus($updateStatusInput: UpdateStatusInput!) {\n    updateUserStatus(updateStatusInput: $updateStatusInput) {\n      ...UserFragment\n    }\n  }\n": types.UpdateUserStatusDocument,
    "\n  mutation UpdateUser($updateUserInput: UpdateUserInput!) {\n    updateUser(updateUserInput: $updateUserInput) {\n      ...UserFragment\n    }\n  }\n": types.UpdateUserDocument,
    "\n  subscription UserStatusChanged($userIds: [String!]!) {\n    userStatusChanged(userIds: $userIds) {\n      ...UserFragment\n    }\n  }\n": types.UserStatusChangedDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ChatFragment on Chat {\n    _id\n    name\n    type\n    isPinned\n    latestMessage {\n      ...MessageFragment\n    }\n    creator {\n      ...UserFragment\n    }\n    members {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  fragment ChatFragment on Chat {\n    _id\n    name\n    type\n    isPinned\n    latestMessage {\n      ...MessageFragment\n    }\n    creator {\n      ...UserFragment\n    }\n    members {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MessageFragment on Message {\n    _id\n    content\n    createdAt\n    chatId\n    user {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  fragment MessageFragment on Message {\n    _id\n    content\n    createdAt\n    chatId\n    user {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFragment on User {\n    _id\n    email\n    username\n    imageUrl\n    status\n  }\n"): (typeof documents)["\n  fragment UserFragment on User {\n    _id\n    email\n    username\n    imageUrl\n    status\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddChatMember($chatMemberInput: ChatMemberInput!) {\n    addChatMember(chatMemberInput: $chatMemberInput) {\n      _id\n      name\n      members {\n        _id\n        username\n        imageUrl\n        status\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddChatMember($chatMemberInput: ChatMemberInput!) {\n    addChatMember(chatMemberInput: $chatMemberInput) {\n      _id\n      name\n      members {\n        _id\n        username\n        imageUrl\n        status\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation BanChatUser($chatBanInput: ChatBanInput!) {\n    banChatUser(chatBanInput: $chatBanInput) {\n      _id\n      name\n      members {\n        ...UserFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation BanChatUser($chatBanInput: ChatBanInput!) {\n    banChatUser(chatBanInput: $chatBanInput) {\n      _id\n      name\n      members {\n        ...UserFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription ChatAdded {\n    chatAdded {\n      ...ChatFragment\n    }\n  }\n"): (typeof documents)["\n  subscription ChatAdded {\n    chatAdded {\n      ...ChatFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription ChatDeleted {\n    chatDeleted {\n      _id\n    }\n  }\n"): (typeof documents)["\n  subscription ChatDeleted {\n    chatDeleted {\n      _id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateChat($createChatInput: CreateChatInput!) {\n    createChat(createChatInput: $createChatInput) {\n      ...ChatFragment\n    }\n  }\n"): (typeof documents)["\n  mutation CreateChat($createChatInput: CreateChatInput!) {\n    createChat(createChatInput: $createChatInput) {\n      ...ChatFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n    createMessage(createMessageInput: $createMessageInput) {\n      ...MessageFragment\n    }\n  }\n"): (typeof documents)["\n  mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n    createMessage(createMessageInput: $createMessageInput) {\n      ...MessageFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser($createUserInput: CreateUserInput!) {\n    createUser(createUserInput: $createUserInput) {\n      _id\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($createUserInput: CreateUserInput!) {\n    createUser(createUserInput: $createUserInput) {\n      _id\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveChat($chatId: String!) {\n    removeChat(chatId: $chatId) {\n      _id\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveChat($chatId: String!) {\n    removeChat(chatId: $chatId) {\n      _id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChatBannedUsers($chatId: String!) {\n    chatBannedUsers(chatId: $chatId) {\n      user {\n        _id\n        username\n        imageUrl\n      }\n      until\n      reason\n    }\n  }\n"): (typeof documents)["\n  query ChatBannedUsers($chatId: String!) {\n    chatBannedUsers(chatId: $chatId) {\n      user {\n        _id\n        username\n        imageUrl\n      }\n      until\n      reason\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Chat($_id: String!) {\n    chat(_id: $_id) {\n      ...ChatFragment\n    }\n  }\n"): (typeof documents)["\n  query Chat($_id: String!) {\n    chat(_id: $_id) {\n      ...ChatFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Chats($skip: Int!, $limit: Int!) {\n    chats(skip: $skip, limit: $limit) {\n      ...ChatFragment\n    }\n  }\n"): (typeof documents)["\n  query Chats($skip: Int!, $limit: Int!) {\n    chats(skip: $skip, limit: $limit) {\n      ...ChatFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Messages($chatId: String!, $skip: Int!, $limit: Int!) {\n    messages(chatId: $chatId, skip: $skip, limit: $limit) {\n      ...MessageFragment\n    }\n  }\n"): (typeof documents)["\n  query Messages($chatId: String!, $skip: Int!, $limit: Int!) {\n    messages(chatId: $chatId, skip: $skip, limit: $limit) {\n      ...MessageFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPublicChats {\n    publicChats {\n      ...ChatFragment\n    }\n  }\n"): (typeof documents)["\n  query GetPublicChats {\n    publicChats {\n      ...ChatFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation JoinChat($chatId: String!) {\n    joinChat(chatId: $chatId) {\n      ...ChatFragment\n    }\n  }\n"): (typeof documents)["\n  mutation JoinChat($chatId: String!) {\n    joinChat(chatId: $chatId) {\n      ...ChatFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription messageCreated($chatIds: [String!]!) {\n    messageCreated(chatIds: $chatIds) {\n      ...MessageFragment\n    }\n  }\n"): (typeof documents)["\n  subscription messageCreated($chatIds: [String!]!) {\n    messageCreated(chatIds: $chatIds) {\n      ...MessageFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PinChat($chatPinInput: ChatPinInput!) {\n    pinChat(chatPinInput: $chatPinInput) {\n      _id\n      name\n      isPinned\n    }\n  }\n"): (typeof documents)["\n  mutation PinChat($chatPinInput: ChatPinInput!) {\n    pinChat(chatPinInput: $chatPinInput) {\n      _id\n      name\n      isPinned\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveChatMember($chatMemberInput: ChatMemberInput!) {\n    removeChatMember(chatMemberInput: $chatMemberInput) {\n      _id\n      name\n      members {\n        ...UserFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveChatMember($chatMemberInput: ChatMemberInput!) {\n    removeChatMember(chatMemberInput: $chatMemberInput) {\n      _id\n      name\n      members {\n        ...UserFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($searchTerm: String!, $limit: Int) {\n    searchUsers(searchTerm: $searchTerm, limit: $limit) {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($searchTerm: String!, $limit: Int) {\n    searchUsers(searchTerm: $searchTerm, limit: $limit) {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnbanChatUser($chatUnbanInput: ChatUnbanInput!) {\n    unbanChatUser(chatUnbanInput: $chatUnbanInput) {\n      _id\n      name\n      bannedUsers {\n        user {\n          ...UserFragment\n        }\n        until\n        reason\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UnbanChatUser($chatUnbanInput: ChatUnbanInput!) {\n    unbanChatUser(chatUnbanInput: $chatUnbanInput) {\n      _id\n      name\n      bannedUsers {\n        user {\n          ...UserFragment\n        }\n        until\n        reason\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnpinChat($chatPinInput: ChatPinInput!) {\n    unpinChat(chatPinInput: $chatPinInput) {\n      _id\n      name\n      isPinned\n    }\n  }\n"): (typeof documents)["\n  mutation UnpinChat($chatPinInput: ChatPinInput!) {\n    unpinChat(chatPinInput: $chatPinInput) {\n      _id\n      name\n      isPinned\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateChat($updateChatInput: UpdateChatInput!) {\n    updateChat(updateChatInput: $updateChatInput) {\n      _id\n      name\n      type\n      creator {\n        _id\n        username\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateChat($updateChatInput: UpdateChatInput!) {\n    updateChat(updateChatInput: $updateChatInput) {\n      _id\n      name\n      type\n      creator {\n        _id\n        username\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserStatus($updateStatusInput: UpdateStatusInput!) {\n    updateUserStatus(updateStatusInput: $updateStatusInput) {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUserStatus($updateStatusInput: UpdateStatusInput!) {\n    updateUserStatus(updateStatusInput: $updateStatusInput) {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUser($updateUserInput: UpdateUserInput!) {\n    updateUser(updateUserInput: $updateUserInput) {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($updateUserInput: UpdateUserInput!) {\n    updateUser(updateUserInput: $updateUserInput) {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription UserStatusChanged($userIds: [String!]!) {\n    userStatusChanged(userIds: $userIds) {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  subscription UserStatusChanged($userIds: [String!]!) {\n    userStatusChanged(userIds: $userIds) {\n      ...UserFragment\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;