import React, { useEffect, useState } from 'react';
import {Form,Input, Button, Layout, Collapse} from 'antd';
import { useHistory } from "react-router-dom";
import Spinner from '../Spinner/Spinner';
import Search from "antd/lib/input/Search";
import Title from "antd/lib/typography/Title";
import AskQuestionModal from './AskQuestionModal';
import Popup from "reactjs-popup";
import TextEditor from './TextEditor';
import {
  EditOutlined,
  PlusSquareFilled,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./AboutBase.less";
import SectionModel from '../../models/AboutBase/SectionModel';
import SubSectionModel from '../../models/AboutBase/SubsectionModel';
import Subsections from './Subsections';

const {Content} = Layout;
const { Panel } = Collapse;

function callback(key: any) {
    console.log(key);
  }

let count = 1;

const AboutBase = () =>{
    const [regionAdm, setRegionAdm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [visibleModal, setVisibleModal] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [searchedData, setSearchedData] = useState("");
    const [form] = Form.useForm();
    const [Sections, setData]= useState<SectionModel[]>([
      {
        id: 0,
        title:"",
        subsection:{
          id:0,
          sectionId:0,
          title:"",
          description:""
        }
      }
    ]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchedData(event.target.value.toLowerCase());
      setLoading(true);
    };

    const handleDelete = (id:SectionModel['id'])=>{
      setData(prev=>prev.filter(item=>item.id!==id))
    }

    const handleEdit = (title: string, id: SectionModel['id']) =>{
      setData(prev=>prev.map(item=>item.id===id?{...item,title}:item))
    }

    const handleAdd = async (index:any) => {
      setLoading(false);
      const newItem = {id:count++, title:'', subsection: JSON.parse(index.subsection)}
      // const res: SectionModel[] = await Api.get();
      // setData(res);
      setData(prev => [...prev.slice(0, index + 1), newItem, ...prev.slice(index + 1)])
      setLoading(true);
    };

    const handleSubmit = async(values:any)=>{
      const newSection: SectionModel = {
        id:0,
        title:"",
        subsection:JSON.parse(values.subsection)
      }
    }
    const editOtlined = () => (
      <EditOutlined className="editInfoIcon"
        //onClick={() =>history.push(``)}
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      />
    );

    const deleteOtlined = () =>(
    <DeleteOutlined className="deleteInfoIcon"
        //onClick={() => seeDeleteModal()}
        //onClick={()=>handleDelete(item.id)}
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
    />
    );
    const showModal = () => setVisibleModal(true);
    
    return !loading ? (
        <Layout.Content className="aboutbase">
            <Title level={1}>Про базу</Title>
            <div className="searchContainer">
            {
                <Button type="primary" onClick={showModal}>
                  Задати запитання
                </Button>
            }
            <Search
          placeholder="Пошук"
          enterButton
          onChange={handleSearch}
        />
            </div>
    {Sections.map((item,index)=>(
    <Collapse 
    onChange={callback} 
    className="section" key={item.id}
    >
    <Panel 
    header={item.title='Section'} 
    key="1" 
    extra={<>{editOtlined()}{deleteOtlined()}</>}
    >
    <Subsections/>
    </Panel>
  </Collapse>
    ))}
    <div className="addSection">
  <Input placeholder="➕ Додати розділ"/>
  <Button type="primary" onClick={()=>handleAdd}>✓</Button>
  </div>
  <AskQuestionModal
            setVisibleModal={setVisibleModal}
            visibleModal={visibleModal}
            //onAdd={handleAdd}
          />
        </Layout.Content>
            
    ) : (
        <Spinner />
      );
};
export default AboutBase;