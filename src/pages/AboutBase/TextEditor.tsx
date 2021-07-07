import React, { useState } from "react";
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SubsectionModel from '../../models/AboutBase/SubsectionModel';
import SectionModel from '../../models/AboutBase/SectionModel';
import formclasses from './TextEditor.css';
import {
    Form,
    Input,
    Button,
    Row,
    Col,
  } from "antd";

  
const TextEditor = () => {
  
    const [form] = Form.useForm();
    const [value, setValue] = useState('');
    const [sectionData, setSectionData] = useState<any[]>([
        {
            id: 0,
            title:"",
            subsection:{
              id:0,
              sectionId:0,
              title:"",
              descroption:"",
              imagePath:""
          }
        }
      ]);
    const[subsectionData, setSubsectionData] = useState<SubsectionModel[]>(Array<SubsectionModel>());
    const handleCancel = () => {
        form.resetFields();
      };
    const handleSubmit = async (values: any) => {
        const newSubsection: SubsectionModel = {
          id:0,
          title:values.title,
          sectionId:JSON.parse(values.section).id,
          description:values.description
        };
    }
    const modules = {
      toolbar:[
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [  'image' ],          // add's image support
                [{ 'align': [] }],
                ['clean']
    ]}
    return (
         <Form 
         className="form" 
         name="basic" 
         onFinish={handleSubmit} 
         layout="vertical"
         form={form}>
             
          <Form.Item
            className={formclasses.formField}
            label="Заголовок"
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true
              }
            ]}>
            <Input
              type="string"
              className={formclasses.inputField}
            />
          </Form.Item>
        
          <Form.Item
            className={formclasses.formField}
            label="Опис"
            labelCol={{ span: 24 }}
            rules={[{ required: true}]}>
            <ReactQuill 
            className={formclasses.text} 
            theme="snow" value={value} 
            onChange={setValue}
            modules={modules}/>
          </Form.Item>
        
          <Form.Item>
            <div className={formclasses.cardButton}>
              <Button key="back" onClick={handleCancel} className={formclasses.buttons}>
                Відмінити
              </Button>
              <Button type="primary" htmlType="submit" className={formclasses.buttons}>
                Опублікувати
              </Button>
            </div>
          </Form.Item>
         </Form>
         
    )
};
        
export default TextEditor