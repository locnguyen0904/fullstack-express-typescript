import { Datagrid, EmailField, List, TextField, TextInput } from "react-admin";

const userFilters = [
  <TextInput key="1" label="Email" source="email" alwaysOn />,
];

const UserList = () => (
  <List filters={userFilters}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="fullName" />
      <EmailField source="email" />
      <TextField source="role" />
    </Datagrid>
  </List>
);

export default UserList;
