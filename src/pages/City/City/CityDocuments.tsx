import React, {useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Avatar, Button, Card, Layout, Spin} from 'antd';
import {FileTextOutlined, CloseOutlined, RollbackOutlined, DownloadOutlined} from '@ant-design/icons';
import {getAllDocuments, getFile, removeDocument, getCityById, cityNameOfApprovedMember} from "../../../api/citiesApi";
import "./City.less";
import CityDocument from '../../../models/City/CityDocument';
import CityProfile from "../../../models/City/CityProfile";
import Title from 'antd/lib/typography/Title';
import moment from "moment";
import Spinner from '../../Spinner/Spinner';
import userApi from "../../../api/UserApi";
import { Roles } from '../../../models/Roles/Roles';

const CityDocuments = () => {
    const {id} = useParams();
    const history = useHistory();

    const [activeUserCity, setActiveUserCity] = useState<string>();
    const [documents, setDocuments] = useState<CityDocument[]>([]);
    const [city, setCity] = useState<CityProfile>(new CityProfile());
    const [canEdit, setCanEdit] = useState<Boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);

    const getCity = async () => {
      setLoading(true);
      try {
        const response = await getCityById(+id);
        const response1 = await cityNameOfApprovedMember(userApi.getActiveUserId());

        setActiveUserCity(response1.data);
        setActiveUserRoles(userApi.getActiveUserRoles);
        setCity(response.data);
       } 
    finally {
      setLoading(false);
    }
  }
    const getDocuments = async () => {
      setLoading(true);
      const response = await getAllDocuments(id);

      setDocuments(response.data.documents);
      setCanEdit(response.data.canEdit);
      setActiveUserRoles(userApi.getActiveUserRoles);
      setLoading(false);
    };

    const downloadDocument = async (fileBlob: string, fileName: string) => {
      await getFile(fileBlob, fileName);
    }

    const removeDocumentById = async (documentId: number) => {
      await removeDocument(documentId);

      setDocuments(documents.filter((d) => d.id !== documentId));
    };

    useEffect(() => {
        getDocuments();
        getCity()
    }, []);

    return (
      <Layout.Content>
        <Title level={2}>Документообіг станиці</Title>
        {loading ? (
          <Spinner />
        ) : (
          <div className="cityMoreItems">           
            {documents.length > 0 ? (
              documents.map((document: CityDocument) => (
                <Card
                  key={document.id}
                  className="detailsCard"
                  title={
                    document.submitDate
                      ? moment(document.submitDate).format("DD.MM.YYYY")
                      : "Немає дати"
                  }
                  headStyle={{ backgroundColor: "#3c5438", color: "#ffffff" }}
                  actions={
                    canEdit ? 
                      [
                        <DownloadOutlined
                          key="download"
                          onClick={() =>
                            downloadDocument(
                              document.blobName,
                              document.fileName
                            )
                          }
                        />,
                        <CloseOutlined
                          key="close"
                          onClick={() => removeDocumentById(document.id)}
                        />                          
                      ]                                                                                                            
                    : ((activeUserRoles.includes(Roles.Supporter) || activeUserRoles.includes(Roles.PlastMember)) 
                    && city.name == activeUserCity )
                     
                    ?
                      [
                        <DownloadOutlined
                          key="download"
                          onClick={() =>
                            downloadDocument(
                              document.blobName,
                              document.fileName
                            )
                          }
                        />    
                      ]
                      : undefined
                  }
                >
                  <Avatar size={86} icon={<FileTextOutlined />} />
                  <Card.Meta
                    className="detailsMeta"
                    title={document.cityDocumentType.name}
                  />
                </Card>
              ))
            ) : (
              <Title level={4}>Ще немає документів станиці</Title>
            )}
          </div>
        )}
        <div className="cityMoreItems">
          <Button
            className="backButton"
            icon={<RollbackOutlined />}
            size={"large"}
            onClick={() => history.goBack()}
            type="primary"
          >
            Назад
          </Button>
        </div>
      </Layout.Content>
    );
};

export default CityDocuments;
