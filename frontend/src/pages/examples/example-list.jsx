import { Datagrid, List, TextField, TextInput } from "react-admin";

const exampleFilters = [
  <TextInput key="1" label="Title" source="title" alwaysOn />,
];

const ExampleList = () => (
  <List filters={exampleFilters}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="content" />
    </Datagrid>
  </List>
);

export default ExampleList;
