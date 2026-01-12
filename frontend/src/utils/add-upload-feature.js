import tokenProvider from "./token-provider";

const addUploadFeature = (dataProvider) => ({
  ...dataProvider,
  update: async (resource, params) => {
    for (const fieldName in params.data) {
      const field = params.data[fieldName];
      if (field && !field.src && field.folder) {
        delete params.data[fieldName];
      }
      if (field && field.rawFile && field.rawFile instanceof File) {
        await uploadFile(params, "file", fieldName);
      }
    }
    return dataProvider.update(resource, params);
  },
  create: async (resource, params) => {
    for (const fieldName in params.data) {
      const field = params.data[fieldName];
      if (field && !field.src && field.folder) {
        delete params.data[fieldName];
      }
      if (field && field.rawFile && field.rawFile instanceof File) {
        await uploadFile(params, "file", fieldName);
      }
    }
    return dataProvider.create(resource, params);
  },
});

export const uploadFile = (params, field, name) => {
  return new Promise((resolve, reject) => {
    if (params.data[name] && params.data[name].rawFile instanceof File) {
      const formData = new FormData();
      if (params.data[name].folder) {
        formData.append("folder", params.data[name].folder);
      }
      formData.append(field, params.data[name].rawFile);
      const token = tokenProvider.getToken();

      fetch("/api/v1/uploads", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((image) => {
          params.data[name] = {
            url: image.data.url,
            originalName: image.data.originalName,
            key: image.data.key,
          };
          resolve();
        })
        .catch((err) => reject(err));
    } else {
      resolve();
    }
  });
};

// This function is currently not used
export const uploadFiles = (params, field, name) => {
  return new Promise((resolve, reject) => {
    const newPictures = params.data[name]?.filter(
      (p) => p.rawFile instanceof File,
    );
    const formerPictures = params.data[name]?.filter(
      (p) => !(p.rawFile instanceof File),
    );

    if (newPictures) {
      const formData = new FormData();
      const token = tokenProvider.getToken();
      newPictures?.map((p) => {
        formData.append(field, p.rawFile);
      });
      fetch("/api/v1/uploads/multi", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((images) => {
          const newUploadPictures = images.data.map((image) => {
            return {
              src: image.src,
              title: image.title,
            };
          });

          const tmp = {
            ...params,
            data: {
              ...params.data,
              [name]: [...formerPictures, ...newUploadPictures],
            },
          };
          resolve(tmp);
        })
        .catch((err) => reject(err));
    } else {
      resolve(params);
    }
  });
};

export default addUploadFeature;
