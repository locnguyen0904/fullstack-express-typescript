import { Admin, Resource } from "react-admin";

import NotFound from "./NotFound";
import users from "./pages/users";
import addUploadFeature from "./utils/addUploadFeature";
import authProvider from "./utils/authProvider";
import httpClient from "./utils/httpClient";
import restProvider from "./utils/restProvider";

const dataProvider = restProvider("/api/v1", httpClient);
const uploadCapableDataProvider = addUploadFeature(dataProvider);

const App = () => (
  <Admin
    dataProvider={uploadCapableDataProvider}
    authProvider={authProvider}
    catchAll={NotFound}
  >
    <Resource name="users" {...users} />
  </Admin>
);

export default App;