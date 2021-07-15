import React, { useState, useEffect } from "react";
import classes from "../../Regions/Form.module.css";
import { Form, DatePicker, AutoComplete, Select, Modal, Button, Input } from "antd";
import adminApi from "../../../api/adminApi";
import notificationLogic from "../../../components/Notifications/Notification";
import {
  addAdministrator,
  editAdministrator,
  getAllAdmins,
} from "../../../api/governingBodiesApi";
import NotificationBoxApi from "../../../api/NotificationBoxApi";
import userApi from "../../../api/UserApi";
import moment from "moment";
import {
  emptyInput,
  incorrectEmail,
  maxLength,
  successfulEditAction,
} from "../../../components/Notifications/Messages"
import GoverningBodyAdmin from "../../../models/GoverningBody/GoverningBodyAdmin";
import AdminType from "../../../models/Admin/AdminType";
import { Roles } from "../../../models/Roles/Roles";
import "./AddAdministrationModal.less"

const confirm = Modal.confirm;

const AddGoverningBodiesSecretaryForm = (props: any) => {
  const [head, setHead] = useState<GoverningBodyAdmin>();
  const { onAdd, setAdmins, setGoverningBodyHead } = props;
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<any>();
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([
    {
      user: {
        id: "",
        firstName: "",
        lastName: "",
        birthday: "",
      },
      regionName: "",
      cityName: "",
      clubName: "",
      userPlastDegreeName: "",
      userRoles: "",
    },
  ]);
  const [workEmail, setWorkEmail] = useState<string>("");

  const getHead = async () => {
    if (props.governingBodyId !== 0) {
      const responseAdmins = await getAllAdmins(props.governingBodyId);
      setHead(responseAdmins.data.head);
    }
  };

  const disabledEndDate = (current: any) => {
    return current && current < startDate;
  };

  const disabledStartDate = (current: any) => {
    return current && current > moment();
  };

  const addGoverningBodyAdmin = async (admin: GoverningBodyAdmin) => {
    await addAdministrator(admin.governingBodyId, admin);
    admin.user.imagePath =  (
        await userApi.getImage(admin.user.imagePath)
      ).data;
    if (admin.adminType.adminTypeName == Roles.GoverningBodyHead) {
      setGoverningBodyHead(admin);        
    }
    setAdmins((old: GoverningBodyAdmin[]) => [...old, admin]);
    notificationLogic("success", "Користувач успішно доданий в провід");
    form.resetFields();
    await NotificationBoxApi.createNotifications(
      [admin.userId],
      `Вам була присвоєна адміністративна роль: '${admin.adminType.adminTypeName}' в `,
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/governingBodies/${props.governingBodyId}`,
      `цьому керівному органі`
    );
  };

  const editGoverningBodyAdmin = async (admin: GoverningBodyAdmin) => {
    await editAdministrator(props.governingBodyId, admin);
    notificationLogic("success", successfulEditAction("Адміністратора"));
    form.resetFields();
    await NotificationBoxApi.createNotifications(
      [admin.userId],
      `Вам була відредагована адміністративна роль: '${admin.adminType.adminTypeName}' в `,
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/governingBodies/${props.governingBodyId}`,
      `цьому керівному органі`);
  };


  const showConfirm = (admin: GoverningBodyAdmin) => {
    confirm({
      title: "Призначити даного користувача на цю посаду?",
      content: (
        <div style={{ margin: 10 }}>
          <b>
            {head?.user.firstName} {head?.user.lastName}
          </b>{" "}
          є Головою Керівного Органу, час правління закінчується{" "}
          <b>
            {moment(head?.endDate).format("DD.MM.YYYY") === "Invalid date"
              ? "ще не скоро"
              : moment(head?.endDate).format("DD.MM.YYYY")}
          </b>
          .
        </div>
      ),
      onCancel() { },
      onOk() {
        if (admin.id === 0) {
          addGoverningBodyAdmin(admin);
        } else {
          editGoverningBodyAdmin(admin);
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    const newAdmin: GoverningBodyAdmin = {
      id: props.admin === undefined ? 0 : props.admin.id,
      userId: props.admin === undefined
        ? JSON.parse(values.userId).id
        : props.admin.userId,
      user: JSON.parse(values.userId),
      adminType: {
        ...new AdminType(),
        adminTypeName: values.AdminType,
      },
      governingBodyId: props.governingBodyId,
      startDate: values.startDate,
      endDate: values.endDate,
      workEmail: workEmail
    };

    onAdd();
    if (newAdmin.id === 0) {
      try {
        if (values.AdminType === Roles.GoverningBodyHead && head !== null) {
          if (head?.userId !== newAdmin.userId) {
            showConfirm(newAdmin);
          } else if (head?.userId === newAdmin.userId) {
          } else {
            editGoverningBodyAdmin(newAdmin);
          }
        } else {
          if (newAdmin.id === 0) {
            addGoverningBodyAdmin(newAdmin);
          }
          else {
            editGoverningBodyAdmin(newAdmin);
          }
        }
      } finally {
        onAdd();
      }
    }
  };

  const onUserSelect = (value: any) => {
    const email: string = JSON.parse(value.toString()).email;
    setWorkEmail(email);
    form.setFieldsValue({workEmail: email});
  }

  useEffect(() => {
    const fetchData = async () => {
      setUsersLoading(true);
      await adminApi.getUsersForTable().then((response) => {
        setUsers(response.data);
        setUsersLoading(false);
      });
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (props.visibleModal) {
      form.resetFields();
    }
    getHead();
  }, [props]);

  return (
    <Form name="basic" onFinish={handleSubmit} form={form}>
      <Form.Item
        className={classes.formField}
        style={{ display: props.admin === undefined ? "flex" : "none" }}
        label="Користувач"
        name="userId"
        rules={[
          {
            required: props.admin === undefined,
            message: <div className="formItemExplain">{emptyInput()}</div>,
          },
        ]}
      >
        <Select
          showSearch
          loading={usersLoading}
          className={classes.inputField}
          onChange={value => onUserSelect(value)}
        >
          {users?.map((o) => (
            <Select.Option key={o.id} value={JSON.stringify(o)}>
              {o.firstName + " " + o.lastName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        className={classes.formField}
        label="Тип адміністрування"
        initialValue={
          props.admin === undefined ? "" : props.admin.adminType.adminTypeName
        }
        name="AdminType"
        rules={[
          {
            required: true,
            message: emptyInput(),
          },
        ]}
      >
        <AutoComplete
          className={classes.inputField}
          options={[
            { value: Roles.GoverningBodyHead },
            { value: "Голова КПР" },
            { value: "Секретар КПР" },
            { value: "Член КПР з питань організаційного розвитку" },
            { value: "Член КПР з соціального напрямку" },
            { value: "Член КПР відповідальний за зовнішні зв'язки" },
          ]}
          placeholder={"Тип адміністрування"}
        />
      </Form.Item>

      <Form.Item
        name="workEmail"
        className={classes.formField}
        label="Електронна пошта"
        rules={[
            {
              pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/,
              message: <div className="formItemExplain">{incorrectEmail}</div>,
            },
            {
              max: 50,
              message: <div className="formItemExplain">{maxLength(50)}</div>,
            },
            {
              required: true,
              message: <div className="formItemExplain">{emptyInput()}</div>,
            }
        ]}
      >
        <Input
          placeholder="Електронна пошта"
          className={classes.inputField}
          value={workEmail}
          onChange={e => setWorkEmail(e.target.value)}
        />
      </Form.Item>

      <Form.Item
        className={classes.formField}
        label="Дата початку"
        name="startDate"
        initialValue={
          props.admin === undefined ? undefined : moment(props.admin.startDate)
        }
      >
        <DatePicker
          className={classes.inputField}
          disabledDate={disabledStartDate}
          onChange={(e) => setStartDate(e)}
          format="DD.MM.YYYY"
        />
      </Form.Item>

      <Form.Item
        className={classes.formField}
        label="Дата кінця"
        name="endDate"
        initialValue={
          props.admin === undefined
            ? undefined
            : props.admin.endDate === null
              ? undefined
              : moment(props.admin.endDate)
        }
      >
        <DatePicker
          className={classes.inputField}
          disabledDate={disabledEndDate}
          format="DD.MM.YYYY"
        />
      </Form.Item>

      <Form.Item style={{ textAlign: "right" }}>
        <Button type="primary" htmlType="submit">
          Опублікувати
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddGoverningBodiesSecretaryForm;
