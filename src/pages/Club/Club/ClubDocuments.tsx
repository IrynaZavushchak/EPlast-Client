import React, {useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Avatar, Button, Card, Layout, Spin} from 'antd';
import {FileTextOutlined, CloseOutlined, RollbackOutlined, DownloadOutlined} from '@ant-design/icons';
import {clubNameOfApprovedMember, getAllDocuments, getFile, removeDocument, getClubById} from "../../../api/clubsApi";
import "./Club.less";
import ClubDocument from '../../../models/Club/ClubDocument';
import ClubProfile from "../../../models/Club/ClubProfile";
import moment from "moment";
import { Roles } from '../../../models/Roles/Roles';
import Spinner from '../../Spinner/Spinner';
import Title from 'antd/lib/typography/Title';
import userApi from "../../../api/UserApi";


const ClubDocuments = () => {
    const {id} = useParams();
    const history = useHistory();

    const [activeUserClub, setActiveUserClub] = useState<string>();
    const [documents, setDocuments] = useState<ClubDocument[]>([]);
    const [canEdit, setCanEdit] = useState<Boolean>(false);
    const [club, setClub] = useState<ClubProfile>(new ClubProfile());
    const [loading, setLoading] = useState<boolean>(false);
    const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);
    

    const getClub = async () => {
      setLoading(true);
      try {
        const response = await getClubById(+id);
        const response1 = await clubNameOfApprovedMember(userApi.getActiveUserId());

        setActiveUserClub(response1.data);
        setActiveUserRoles(userApi.getActiveUserRoles);
        setClub(response.data);
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
        getClub();
    }, []);

    return (
      <Layout.Content>
        <Title level={2}>Документообіг куреня</Title>
        {loading ? (
          <Spinner />
        ) : (
          <div className="clubMoreItems">
            {documents.length > 0 ? (
              documents.map((document: ClubDocument) => (
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
                    canEdit
                      ? [
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
                          />,
                        ]
                        
                      : ((activeUserRoles.includes(Roles.Supporter) || activeUserRoles.includes(Roles.PlastMember)) 
                      && club.name == activeUserClub ) 
                      ? [
                          <DownloadOutlined
                            key="download"
                            onClick={() =>
                              downloadDocument(
                                document.blobName,
                                document.fileName
                              )
                            }
                          />,
                        ]
                        : undefined
                  }
                >
                  <Avatar size={86} icon={<FileTextOutlined />} />
                  <Card.Meta
                    className="detailsMeta"
                    title={document.clubDocumentType.name}
                  />
                </Card>
              ))
            ) : (
              <Title level={4}>Ще немає документів куреня</Title>
            )}
          </div>
        )}
        <div className="clubMoreItems">
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

export default ClubDocuments;
