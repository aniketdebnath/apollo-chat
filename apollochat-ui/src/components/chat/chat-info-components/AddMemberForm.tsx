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
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  searchResults,
  searching,
  addingMember,
  onSearch,
  onAddMember,
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
        mb: 2,
        p: 2,
        borderRadius: 2.5,
        backgroundColor: alpha(theme.palette.background.default, 0.4),
      }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                endAdornment: (
                  <>
                    {searching ? (
                      <CircularProgress
                        color="inherit"
                        size={20}
                      />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              key={option._id}>
              <UserAvatar
                username={option.username}
                imageUrl={option.imageUrl}
                sx={{ mr: 1.5 }}
              />
              {option.username}
            </Box>
          )}
        />
        <Button
          variant="contained"
          onClick={handleAddMember}
          disabled={!selectedUser || addingMember}>
          {addingMember ? (
            <CircularProgress
              size={24}
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
