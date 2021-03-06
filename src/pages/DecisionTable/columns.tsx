import classes from '*.module.css';
import { Tooltip } from 'antd';
import moment from 'moment';
import React from 'react';
import decisionsApi, { statusTypeGetParser } from '../../api/decisionsApi';
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    fixed: true,
    width: 60
  },
  {
    title: 'Назва',
    dataIndex: 'name',
  },
  {
    title: 'Керівний орган',
    dataIndex: 'governingBody',
  },
  {
    title: 'Статус',
    dataIndex: 'decisionStatusType',
    render: (decisionStatusType: any) => {
        return typeof(decisionStatusType) === "number" ?
            statusTypeGetParser(decisionStatusType) : decisionStatusType;
    }
  },
  {
    title: 'Рішення для',
    dataIndex: 'decisionTarget',
  },
  {
    title: 'Рішення',
    dataIndex: 'description',
    render: (description: any) => (
      <Tooltip placement="topLeft" title={description.substring(0, 400)}>
        {description}
      </Tooltip>
    ),
  },
  {
    title: 'Дата',
    dataIndex: 'date',
    render: (date: Date) => {
      return moment(date.toLocaleString()).format('DD.MM.YYYY');
  },
  },
  {
    title: 'Додатки',
    dataIndex: 'fileName',
    render : (fileName : string |null) =>{ 
      if( fileName != null){
        return <button type = "button" onClick = {
          async () =>  {
             await decisionsApi.getFileAsBase64(fileName);}}
             >Завантажити додаток</button>;
      }
      return ""; 
  },}
];
export default columns;
