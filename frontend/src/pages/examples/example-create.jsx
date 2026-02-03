import { Create, required, SimpleForm, TextInput } from "react-admin";

const ExampleCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <TextInput source="content" multiline validate={required()} />
    </SimpleForm>
  </Create>
);

export default ExampleCreate;
