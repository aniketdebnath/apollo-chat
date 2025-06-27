import { useMutation } from "@apollo/client";
import { snackVar } from "../constants/snack";
import { graphql } from "../gql";
import { MeDocument, UpdateUserDocument } from "../gql/graphql";

export const UPDATE_USER = graphql(`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      ...UserFragment
    }
  }
`);

/**
 * Hook for updating user profile information
 * @returns Mutation function and related state
 */
export const useUpdateUser = () => {
  const [updateUser, { loading, error }] = useMutation(UpdateUserDocument, {
    onError: (error) => {
      snackVar({
        message: `Failed to update profile: ${error.message}`,
        type: "error",
      });
    },
    onCompleted: () => {
      snackVar({
        message: "Profile updated successfully",
        type: "success",
      });
    },
    refetchQueries: [{ query: MeDocument }],
  });

  return {
    updateUser,
    loading,
    error,
  };
};
