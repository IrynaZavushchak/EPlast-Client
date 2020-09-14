import React, {useEffect, useState} from 'react';
import {List, Divider, Row, Col, Input, Tooltip } from 'antd';
import Distinction from '../Interfaces/Distinction';
import distinctionApi from '../../../api/distinctionApi';
import { EditOutlined, DeleteOutlined, PlusOutlined, PlusSquareFilled } from '@ant-design/icons';
import notificationLogic from '../../../components/Notifications/Notification';
import Button from 'antd/es/button';
import classes from './FormEdit.module.css';
import { render } from '@testing-library/react';
import Item from 'antd/lib/list/Item';
import DeleteTypeConfirm from './DeleteTypeConfirm';

type FormEditDistinctionTypesProps = {
    setVisibleModal: (visibleModal: boolean) => void;
}

const FormEditDistinctionTypes : React.FC<FormEditDistinctionTypesProps> = (props: any) => {

    const {setVisibleModal} = props;
    const [distData, setDistData] = useState<Distinction[]>([{
        name: '',
        id: 0
    }])

    useEffect( () => {
        const fetchData = async () => {
            const distData = (await distinctionApi.getDistinctions()).data
            setDistData(distData);
        };
        fetchData();
      }, []);

      const handleDelete = (id: number) => {
        const filteredData = distData.filter((d: { id: number; }) => d.id !== id);
        setDistData([...filteredData]);
        notificationLogic("success","Тип відзначення успішно видалено!")
      }

      return (
          <div>
            <List
            className = {classes.list}
            header={null}
            footer={null}
            bordered
            dataSource={distData}
            renderItem={item => 
                <List.Item
                    actions={[
                        <Tooltip title="Редагувати відзначення">
                            <EditOutlined className = {classes.editIcon} />
                        </Tooltip>, 
                        <Tooltip title ="Видалити відзначення">
                            <DeleteOutlined className = {classes.deleteIcon} onClick ={() => DeleteTypeConfirm(item.id, handleDelete)} />
                        </Tooltip>]}
                >
                    {item.name}
                    </List.Item>
            }
            />
            <div className = {classes.addDiv}>
                <Item>
                    <Input className={ classes.inputField }
                    placeholder="Назва типу відзначення"></Input> 
                </Item>
                
                <Button
                 type="primary" htmlType="submit"
                >
                 Додати
                </Button>
            </div>
        </div>
    )
}

export default FormEditDistinctionTypes;