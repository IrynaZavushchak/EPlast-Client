import { AxiosError } from "axios";
import ClubAnnualReport from "../pages/AnnualReport/Interfaces/ClubAnnualReport";
import api from "./api";
import Api from "./api";

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

export const getClubById = async (id: number) => {
  return await api.get(`Club/Profile/${id}`, id).catch((error) => {
    throw new Error(error);
  });
};

export const getClubMembersInfo = async (id: number) => {
  return await api.get(`Club/ClubMembersInfo/${id}`, id).catch((error)=>{throw new Error(error);});
}

export const createClubAnnualReport = async (data: any) => {
  return await api.post(`Club/CreateClubAnnualReport`,JSON.stringify(data)) .catch((error: AxiosError) => {
    throw error;
});
};

export const removeClubAnnualReport = async (id: number) => {
  return await api.remove(`Club/deleteClubAnnualReport/${id}`)
      .catch((error: AxiosError) => {
          throw new Error(error.response?.data.message);
      });
}

export const confirmClubAnnualReport = async (id: number) => {
  return await api.put(`Club/confirmClubAnnualReport/${id}`) .catch((error) => {
    throw new Error(error);
});
};

export const cancelClubAnnualReport = async (id: number) => {
  return await api.put(`Club/cancelClubAnnualReport/${id}`) .catch((error) => {
    throw new Error(error);
});
};

export const getClubAnnualReport = async () => {
  return await api.get(`Club/GetAllClubAnnualReports`).catch((error) => {
    throw new Error(error);
  });
};

export const getSearchedClubAnnualReports = async (searchedData: string, page: number, pageSize: number, sortKey: number, authReport: boolean) => {
  return await api.get(`Club/ClubAnnualReports`,{searchedData: searchedData,
    page: page,
    pageSize: pageSize,
    sortKey: sortKey,
    auth: authReport,
  }).catch((error) => {
    throw new Error(error);
  });
};


export const getClubAnnualReportById = async (id:number) => {
  return await api.get(`Club/GetClubAnnualReportById/${id}`,id).catch((error) => {
    throw new Error(error);
  });
};

export const editClubAnnualReport = async (data: ClubAnnualReport) => {
  return await api.put('Club/editClubAnnualReport', data)
      .catch((error: AxiosError) => {
          throw new Error(error.response?.data.message);
      });
}

export const getClubByPage = async (page: number, pageSize: number, clubName: string | null = null) => {
  return api
    .get(`ClubCache/Profiles/${page}`, { page, pageSize, clubName })
    .catch((error) => {
      throw new Error(error);
    });
};

export const createClub = async (data: any) => {
  return api.post("Club/CreateClub", data).catch((error) => {
    throw new Error(error);
  });
};

export const updateClub = async (id: number, data: any) => {
  return api.put(`Club/EditClub/${id}`, data).catch((error) => {
    throw new Error(error);
  });
};

export const removeClub = async (id: number) => {
  return api.remove(`Club/RemoveClub/${id}`, id).catch((error) => {
    throw new Error(error);
  });
};

export const getLogo = async (logoName: string) => {
  return api.get("Club/LogoBase64", { logoName })
};

export const getAllAdmins = async (id: number) => {
  return api.get(`Club/Admins/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const getAllDocuments = async (id: number) => {
  return api.get(`Club/Documents/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const getAllMembers = async (id: number) => {
  return api.get(`Club/Members/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const getAllFollowers = async (id: number) => {
  return api.get(`Club/Followers/${id}`).catch((error) => {
    throw new Error(error);
  });
};

export const toggleMemberStatus = async (id: number) => {
  return api.put(`Club/ChangeApproveStatus/${id}`, id).catch((error) => {
    throw new Error(error);
  });
}

export const clubNameOfApprovedMember = async(memberId: string) =>{
  return api.get(`Club/ClubNameOfApprovedMember/${memberId}`, {memberId:memberId}).catch((error)=>{
    throw new Error(error)
  });
}; 

export const addFollower = async (clubId: number) => {
  return api.post(`Club/AddFollower/${clubId}`, clubId).catch((error) => {
    throw new Error(error);
  });
}

export const addFollowerWithId = async (clubId: number, userId: string) => {
  return api.post(`Club/AddFollowerWithId/${clubId}/${userId}`).catch((error) => {
    throw new Error(error);
  });
}

export const removeFollower = async (followerId: number) => {
  return api.remove(`Club/RemoveFollower/${followerId}`, followerId).catch((error) => {
    throw new Error(error);
  });
}

export const addAdministrator = async (clubId: number, data: any) => {
  return api.post(`Club/AddAdmin/${clubId}`, data).catch((error) => {
    throw new Error(error);
  });
}

export const removeAdministrator = async (adminId: number) => {
  return api.put(`Club/RemoveAdmin/${adminId}`, adminId).catch((error) => {
    throw new Error(error);
  });
}

export const editAdministrator = async (adminId: number, data: any) => {
  return api.put(`Club/EditAdmin/${adminId}`, data).catch((error) => {
    throw new Error(error);
  });
}

export const addDocument = async (clubId: number, data: any) => {
  return api.post(`Club/AddDocument/${clubId}`, data).catch((error) => {
    throw new Error(error);
  });
}

export const removeDocument = async (documentId: number) => {
  return api.remove(`Club/RemoveDocument/${documentId}`, documentId).catch((error) => {
    throw new Error(error);
  });
}

export const getFile = async (fileBlob: string, fileName: string) => {
  const response = await (await api.get(`Club/FileBase64/${fileBlob}`, fileBlob)).data;
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
  return api.get(`Club/GetDocumentTypes`).catch((error) => {
    throw new Error(error);
  });
}

export const getClubsOptions = async () => {
  return api.get(`Club/ClubsOptions`).catch((error) => {
    throw new Error(error);
  });
}

export const checkCreated = async (clubId: number) => {
  return await Api.get(`AnnualReport/checkCreatedClubReport/${clubId}`)
      .catch((error: AxiosError) => {
        throw new Error(error.response?.data.message);
      });
}

export const getUsersAdministrations = async(UserId:string)=>{
   return api.get(`Club/GetUserAdmins/${UserId}`);
  
}


export const getUsersPreviousAdministrations = async(UserId:string)=>{
  return api.get(`Club/GetUserPreviousAdmins/${UserId}`);
}
 

export const getClubs = async()=>{
  return api.get(`Club/Clubs`);
}

export default {
  getClubs,
  checkCreated,
  getClubsOptions
}
