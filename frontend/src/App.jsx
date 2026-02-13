import { Admin, Resource } from "react-admin";

import NotFound from "@/not-found";
import examples from "@/pages/examples";
import users from "@/pages/users";
import addUploadFeature from "@/utils/add-upload-feature";
import authProvider from "@/utils/auth-provider";
import httpClient from "@/utils/http-client";
import restProvider from "@/utils/rest-provider";

const dataProvider = restProvider("/api/v1", httpClient);
const uploadCapableDataProvider = addUploadFeature(dataProvider);

const App = () => (
  <Admin
    dataProvider={uploadCapableDataProvider}
    authProvider={authProvider}
    catchAll={NotFound}
  >
    <Resource name="examples" {...examples} />
    <Resource name="users" {...users} />
  </Admin>
);

export default App;
