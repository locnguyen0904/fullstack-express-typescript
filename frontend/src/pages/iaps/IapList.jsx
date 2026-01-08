import { List, Datagrid, TextField, EditButton } from "react-admin";

const IapList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="deviceId" />
      <TextField source="productId" />
      <TextField source="environment" />
      <TextField source="originalTransactionId" />
      <EditButton />
    </Datagrid>
  </List>
);

export default IapList;
