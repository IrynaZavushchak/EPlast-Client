import React from 'react';
import { Button, Form, Input, Layout, List, Select } from "antd";
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, InfoOutlined } from "@ant-design/icons";

import styles from './FormAskQuestion.css';
import AuthorizeApi from "../../api/authorizeApi";
import { useHistory } from 'react-router-dom';
import ReactInputMask from "react-input-mask";
import{
  emptyInput,
  incorrectEmail,
  incorrectPhone,
} from "../../components/Notifications/Messages"

type FormAskQuestionProps = {
    setVisibleModal: (visibleModal: boolean) => void;
  };

  let authService = new AuthorizeApi();

  const FormAskQuestion: React.FC<FormAskQuestionProps> = (props: any) => {
    const [form] = Form.useForm();
    const history = useHistory();
  
    const handleSubmit = async (values: any) => {
      if(values.PhoneNumber === "")
      {
        values.PhoneNumber = undefined;
      }
      
      await authService.sendQuestionAdmin(values);
      history.push("/aboutBase");
      form.resetFields();
    };
  
    const validateMessages = {
      required: emptyInput(),
      types: {
        email: incorrectEmail,
        string: incorrectPhone,
      },
    };

  return (
    <Form
    className={styles.contactsForm}
    layout="vertical"
    initialValues={{ prefix: "+380" }}
    form={form} 
    validateMessages={validateMessages}
    onFinish={handleSubmit}
  >
    <Form.Item
      name="Name"
      label="Вкажіть Ваше ім'я"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="Email"
      label="Вкажіть Вашу електронну пошту"
      rules={[{ type: "email", required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="PhoneNumber"
      label="Вкажіть Ваш номер телефону"
      rules={[{min:18, message:incorrectPhone}]}
      >
      <ReactInputMask
        mask="+380(99)-999-99-99"
        maskChar={null}
      >
        {(inputProps: any) => <Input  {...inputProps} type="tel" />}
      </ReactInputMask>
    </Form.Item>
    <Form.Item
      name="FeedBackDescription"
      label="Опишіть Ваше звернення"
      rules={[{ required: true }]}
    >
      <Input.TextArea />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" type="primary">
        Відправити
      </Button>
    </Form.Item>
  </Form>
  );
};

export default FormAskQuestion;