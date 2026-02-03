import { Edit, required, SimpleForm, TextInput } from "react-admin";

const ExampleTitle = ({ record }) => {
  return <span>Example {record ? record.title : ""}</span>;
};

const ExampleEdit = () => (
  <Edit title={<ExampleTitle />}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="title" validate={required()} />
      <TextInput source="content" multiline validate={required()} />
    </SimpleForm>
  </Edit>
);

export default ExampleEdit;
