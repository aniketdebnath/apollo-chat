import React, { useRef, useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  useTheme,
  alpha,
} from "@mui/material";
import { User } from "../../../gql/graphql";
import { UserAvatar } from "../../common/UserAvatar";

interface AddMemberFormProps {
  searchResults: User[];
  searching: boolean;
  addingMember: boolean;
  onSearch: (term: string) => void;
  onAddMember: (user: User | null) => Promise<void>;
  isSmallScreen?: boolean;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  searchResults,
  searching,
  addingMember,
  onSearch,
  onAddMember,
  isSmallScreen = false,
}) => {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = (term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(term);
    }, 300);
  };

  const handleAddMember = async () => {
    try {
      await onAddMember(selectedUser);
      setSelectedUser(null);
    } catch (err) {
      // Error is handled in the hook via snackVar
    }
  };

  return (
    <Card
      sx={{
        mb: isSmallScreen ? 1.5 : 2,
        p: isSmallScreen ? 1.5 : 2,
        borderRadius: isSmallScreen ? 2 : 2.5,
        backgroundColor: alpha(theme.palette.background.default, 0.4),
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isSmallScreen ? 0.5 : 1,
        }}>
        <Autocomplete
          fullWidth
          options={searchResults}
          getOptionLabel={(option) => option.username}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          onChange={(e, value) => setSelectedUser(value)}
          onInputChange={(e, newInputValue) => debouncedSearch(newInputValue)}
          loading={searching}
          value={selectedUser}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search users to add"
              size="small"
              InputProps={{
                ...params.InputProps,
                style: {
                  fontSize: isSmallScreen ? "0.875rem" : "inherit",
                },
                endAdornment: (
                  <>
                    {searching ? (
                      <CircularProgress
                        color="inherit"
                        size={isSmallScreen ? 16 : 20}
                      />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              InputLabelProps={{
                style: {
                  fontSize: isSmallScreen ? "0.875rem" : "inherit",
                },
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              key={option._id}
              sx={{
                fontSize: isSmallScreen ? "0.875rem" : "inherit",
                py: isSmallScreen ? 0.75 : 1,
              }}>
              <UserAvatar
                username={option.username}
                imageUrl={option.imageUrl}
                sx={{ mr: isSmallScreen ? 1 : 1.5 }}
                size={isSmallScreen ? "small" : "medium"}
              />
              {option.username}
            </Box>
          )}
        />
        <Button
          variant="contained"
          onClick={handleAddMember}
          disabled={!selectedUser || addingMember}
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            px: isSmallScreen ? 1.5 : 2,
            py: isSmallScreen ? 0.75 : 1,
            fontSize: isSmallScreen ? "0.875rem" : "inherit",
            minWidth: isSmallScreen ? "auto" : "64px",
          }}>
          {addingMember ? (
            <CircularProgress
              size={isSmallScreen ? 20 : 24}
              color="inherit"
            />
          ) : (
            "Add"
          )}
        </Button>
      </Box>
    </Card>
  );
};

export default AddMemberForm;
