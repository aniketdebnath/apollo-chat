import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { UserStatus } from "../constants/userStatus";
import { snackVar } from "../constants/snack";

export const UPDATE_STATUS = graphql(`
  mutation UpdateUserStatus($updateStatusInput: UpdateStatusInput!) {
    updateUserStatus(updateStatusInput: $updateStatusInput) {
      ...UserFragment
    }
  }
`) as unknown as DocumentNode;

export const useUpdateStatus = () => {
  const [updateStatusMutation, { loading, error }] = useMutation(UPDATE_STATUS);

  const updateStatus = async (status: UserStatus) => {
    try {
      const { data } = await updateStatusMutation({
        variables: {
          updateStatusInput: {
            status,
          },
        },
      });

      snackVar({
        message: `Status updated to ${status}`,
        type: "success",
      });

      return data?.updateUserStatus;
    } catch (err) {
      console.error("Error updating status:", err);
      snackVar({
        message: "Failed to update status",
        type: "error",
      });
      throw err;
    }
  };

  return {
    updateStatus,
    loading,
    error,
  };
};
