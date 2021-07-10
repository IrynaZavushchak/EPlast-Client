import CityMember from "../models/City/CityMember";
import api from "./api";

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let { length } = bstr;
  const u8arr = new Uint8Array(length);

  while (length !== -1) {
    u8arr[length] = bstr.charCodeAt(length);
    length -= 1;
  }

  return new File([u8arr], filename, { type: mime });
};

export const getCityById = async (id: number) => {
  return await api.get(`Cities/Profile/${id}`, id).catch((error) => {
    throw new Error(error);
  });
};

export const getCitiesByPage = async (page: number, pageSize: number, cityName: string | null = null) => {
  return api
    .get(`CitiesCache/Profiles/${page}`, { page, pageSize, cityName })
    .catch((error) => {
      throw new Error(error);
    });
};

export const createCity = async (data: any) => {
  return api.post("Cities/CreateCity", data).catch((error) => {
    throw new Error(error);
  });
};

export const updateCity = async (id: number, data: any) => {
  return api.put(`Cities/EditCity/${id}`, data).catch((error) => {
    throw new Error(error);
  });
};

export const removeCity = async (id: number) => {
  return api.remove(`Cities/RemoveCity/${id}`, id).catch((error) => {
    throw new Error(error);
  });
};

export const getLogo = async (logoName: string) => {
  return api.get("Cities/LogoBase64", { logoName })
};

export const getAllAdmins = async (id: number) => {
  return api.get(`Cities/Admins/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const getAllDocuments = async (id: number) => {
  return api.get(`Cities/Documents/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const getAllMembers = async (id: number) => {
  return api.get(`Cities/Members/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const getAllFollowers = async (id: number) => {
  return api.get(`Cities/Followers/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const toggleMemberStatus = async (id: number) => {
  return api.put(`Cities/ChangeApproveStatus/${id}`, id).catch((error) => {
    throw new Error(error);
  });
}

export const cityNameOfApprovedMember = async(id: string) =>{
  return api.get(`Cities/CityNameOfApprovedMember/${id}`).catch((error)=>{
    throw new Error(error)
  });
};

export const addFollower = async (cityId: number) => {
  return api.post(`Cities/AddFollower/${cityId}`, cityId).catch((error) => {
    throw new Error(error);
  });
}

export const addFollowerWithId = async (cityId: number, userId: string) => {
  return api.post(`Cities/AddFollowerWithId/${cityId}/${userId}`).catch((error) => {
    throw new Error(error);
  });
}

export const removeFollower = async (followerId: number) => {
  return api.remove(`Cities/RemoveFollower/${followerId}`, followerId).catch((error) => {
    throw new Error(error);
  });
}

export const addAdministrator = async (cityId: number, data: any) => {
  return api.post(`Cities/AddAdmin/${cityId}`, data).catch((error) => {
    throw new Error(error);
  });
}

export const removeAdministrator = async (adminId: number) => {
  return api.put(`Cities/RemoveAdmin/${adminId}`, adminId).catch((error) => {
    throw new Error(error);
  });
}

export const editAdministrator = async (adminId: number, data: any) => {
  return api.put(`Cities/EditAdmin/${adminId}`, data).catch((error) => {
    throw new Error(error);
  });
}

export const addDocument = async (cityId: number, data: any) => {
  return api.post(`Cities/AddDocument/${cityId}`, data).catch((error) => {
    throw new Error(error);
  });
}

export const removeDocument = async (documentId: number) => {
  return api.remove(`Cities/RemoveDocument/${documentId}`, documentId).catch((error) => {
    throw new Error(error);
  });
}

export const getFile = async (fileBlob: string, fileName: string) => {
  const response = await (await api.get(`Cities/FileBase64/${fileBlob}`, fileBlob)).data;
  const file = dataURLtoFile(response, fileBlob);
  const anchor = window.document.createElement('a');
  anchor.href = window.URL.createObjectURL(file);
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(anchor.href);
  return response;
}

export const getDocumentTypes = async () => {
  return api.get(`Cities/GetDocumentTypes`).catch((error) => {
    throw new Error(error);
  });
}


export const getusersPreviousAdministrations = async(UserId:string)=>{
  return await api.get(`Cities/GetUserPreviousAdmins/${UserId}`).catch((error)=>{
    throw new Error(error);
  })
}


export const getUsersAdministrations = async(UserId:string)=>{
   return api.get(`Cities/GetUserAdmins/${UserId}`);
  
}


export const getCities = async ()=>{
  return await api.get(`Cities/Cities`).catch(error => {
    throw new Error(error);
  });
}
export default {
  getCities, getUsersAdministrations, getusersPreviousAdministrations, getDocumentTypes
}