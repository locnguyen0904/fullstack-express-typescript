import { List, Datagrid, TextField, EditButton } from "react-admin";

const DeviceTokenList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="deviceId" />
      <TextField source="platform" />
      <EditButton />
    </Datagrid>
  </List>
);

export default DeviceTokenList;
