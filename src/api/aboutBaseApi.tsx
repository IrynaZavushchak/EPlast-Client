import Section from "../models/AboutBase/SectionModel";
import Subsection from "../models/AboutBase/SubsectionModel";
import api from "./api";

const getAboutBaseSectionById = async (id:number)=>{
    return await api.get(`AboutBaseSection/${id}`,id);
};

const getAboutBaseSubsectionById = async (id: number)=>{
    return await api.get(`AboutBaseSubsection/${id}`,id);
};

const getAboutBaseSections = async () =>{
    return (await api.get(`AboutBaseSections`)).data;
};

const getAboutBaseSubsections = async () =>{
    return (await api.get(`AboutBaseSubsections`)).data;
};

const deleteAboutBaseSection = async (id:number) =>{
    return await api.remove(`DeleteSection/${id}`,id);
};

const deleteAboutBaseSubsection = async(id:number)=>{
    return await api.remove(`DeleveSubsection//${id}`,id);
};

const addAboutBaseSection = async (data: Section)=>{
    return await api.post(`AboutBaseSection/Create/${data.id}`,data);
};

const addAboutBaseSubsection = async (data:Subsection)=>{
    return await api.post(`AboutBaseSubsection/Create/${data.id}`,data);
};

const editAboutBaseSection = async (data:Section)=>{
    return await api.put(`EditSection/${data.id}`,data);
};

const editAboutBaseSubsection = async (data:Subsection)=>{
    return await api.put(`EditSubsection/${data.id}`,data);
};

export default {
    getAboutBaseSectionById,
    getAboutBaseSubsectionById,
    getAboutBaseSections,
    getAboutBaseSubsections,
    deleteAboutBaseSection,
    deleteAboutBaseSubsection,
    editAboutBaseSection,
    editAboutBaseSubsection,
    addAboutBaseSection,
    addAboutBaseSubsection
};