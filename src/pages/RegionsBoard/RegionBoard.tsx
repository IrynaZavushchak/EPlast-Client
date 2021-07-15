import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Row,
  Col,
  Button,
  Layout,
  Skeleton,
  Card,
  Tooltip,
  Badge,
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  PlusSquareFilled,
  FileDoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  getRegionDocuments,
  GetRegionsBoard,
} from "../../api/regionsApi";
import {
  getUserAccess
} from "../../api/regionsBoardApi";
import "../Regions/Region.less";
import CityDefaultLogo from "../../assets/images/default_city_image.jpg";
import Title from "antd/lib/typography/Title";
import Paragraph from "antd/lib/typography/Paragraph";
import Spinner from "../Spinner/Spinner";
import AddDocumentModal from "./AddDocModal";
import CityDocument from "../../models/City/CityDocument";
import RegionDetailDrawer from "./RegionsBoardDetailDrawer";
import Crumb from "../../components/Breadcrumb/Breadcrumb";
import decisionsApi, {
  Decision,
  statusTypeGetParser,
  GoverningBody,
} from "../../api/decisionsApi";
import { getGoverningBodiesList, getGoverningBodyLogo } from "../../api/governingBodiesApi";
import AddDecisionModal from "../DecisionTable/AddDecisionModal";
import notificationLogic from "../../components/Notifications/Notification";
import AuthStore from "../../stores/AuthStore";
import jwt from 'jwt-decode';

const RegionBoard = () => {
  const history = useHistory();
  const [visibleModal, setVisibleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoStatus, setPhotoStatus] = useState(true);
  const [document, setDocument] = useState<any>({
    ID: "",
    SubmitDate: "",
    BlobName: "",
    FileName: "",
    RegionId: "",
  });

  const [documents, setDocuments] = useState<any[]>([
    {
      id: "",
      submitDate: "",
      blobName: "",
      fileName: "",
      regionId: "",
    },
  ]);

  const [region, setRegion] = useState<any>({
    id: "",
    regionName: "",
    description: "",
    logo: "",
    administration: [{}],
    cities: [{}],
    phoneNumber: "",
    email: "",
    link: "",
    documents: [{}],
    postIndex: "",
    city: "",
  });

  const [governingBodies, setGoverningBodies] = useState<GoverningBody[]>([
    {
      id: 0,
      governingBodyName: "",
      logo: "",
      description: "",
      phoneNumber: "",
      email: ""
    },
  ]);

  const [orgsCount, setOrgsCount] = useState<number>();
  const [decisionsCount, setDecisionsCount] = useState<number>();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [visibleDecisionModal, setVisibleDecisionModal] = useState<boolean>(false);
  const [gbPhotosAreLoading, setGbPhotosAreLoading] = useState<boolean>(false);
  const [userAccesses, setUserAccesses] = useState<{[key: string]: boolean}>({})

  const getRegion = async () => {
    setLoading(true);
    try {
      const response = await GetRegionsBoard();
      await getUserAccesses();
      if (userAccesses["ViewDecisions"]) {        
        setRegionDecisions();
      }
      setRegionOrgs();
      setRegionDocs(response.data.id);
      setRegion(response.data);
      if (response.data.logo == null) {
        setPhotoStatus(false);
      }
      } finally {
        setLoading(false);
    }
  };
  
  const getUserAccesses = async () => {
      let user: any = jwt(AuthStore.getToken() as string);
      await getUserAccess(user.nameid).then(
        response => {
          setUserAccesses(response.data);
        }
      );
  }

  const loadGbPhotos = async (governingBodies: GoverningBody[]) => {
    
    for (let i = 0; i < governingBodies.length; i++) {
      if (governingBodies[i].logo == undefined) continue;
      governingBodies[i].logo = (
        await getGoverningBodyLogo(governingBodies[i].logo!)
      ).data;
    }

    setGbPhotosAreLoading(false);
  };

  const onAdd = (newDocument: CityDocument) => {
    if (documents.length < 6) {
      setDocuments([...documents, newDocument]);
    }
  };

  const setRegionDocs = async (id: number) => {
    try {
      const response: [] = await (await getRegionDocuments(id)).data;
      setDocuments(
        response.length > 6 ? response.slice(response.length - 6) : response
      );
    } finally {
    }
  };

  const setRegionOrgs = async () => {
    const responseOrgs: GoverningBody[] = await getGoverningBodiesList();
    setOrgsCount(responseOrgs.length);
    responseOrgs.length > 6
      ? setGoverningBodies(responseOrgs.slice(responseOrgs.length - 6))
      : setGoverningBodies(responseOrgs);
    setGbPhotosAreLoading(true);
    loadGbPhotos(responseOrgs);
  };

  const setRegionDecisions = async () => {
    const decisions: Decision[] = await decisionsApi.getAll();
    setDecisionsCount(decisions.length);
    decisions.length > 6
      ? setDecisions(decisions.slice(decisions.length - 6))
      : setDecisions(decisions);
  };

  const handleAdd = async () => {
    const lastId = decisions[decisions.length - 1].id;
    let user: any;
    let curToken = AuthStore.getToken() as string;
    user = jwt(curToken);
    await decisionsApi
      .getById(lastId + 1)
      .then((res) => {
        const dec: Decision = {
          id: res.id,
          name: res.name,
          governingBody: res.governingBody.governingBodyName,
          decisionStatusType: statusTypeGetParser(res.decisionStatusType),
          decisionTarget: res.decisionTarget.targetName,
          description: res.description,
          fileName: res.fileName,
          userId: user.nameid,
          date: res.date,
        };
        setDecisions([...decisions.slice(1), dec]);
      })
      .catch(() => {
        notificationLogic("error", "Рішення не існує");
      });
  };

  const openPDF = async (item: any) => {
    const pdf = await decisionsApi.getPdf(item.id);
    window.open(pdf);
  };

  useEffect(() => {
    getRegion();
  }, []);


  return loading ? (
    <Spinner />
  ) : (
    <Layout.Content className="cityProfile">
      <Row style={{justifyContent:"center"}} gutter={[0, 48]}>
        <Col xl={15} sm={24} xs={24}>
          <Card hoverable className="cityCard">
            <div>
              <Crumb first="/" second_name="Крайовий Провід Пласту" />
            </div>
            <Title level={2}>{region.regionName}</Title>
            <Row className="cityPhotos" gutter={[0, 12]}>
              <Col md={13} sm={24} xs={24}>
                {photoStatus ? (
                  <img src={region.logo} alt="Region" className="cityLogo" />
                ) : (
                  <img
                    src={CityDefaultLogo}
                    alt="Region"
                    className="cityLogo"
                  />
                )}
              </Col>
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                <iframe
                  src=""
                  title="map"
                  aria-hidden="false"
                  className="mainMap"
                />
              </Col>
            </Row>
            <Row className="cityInfo">
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                {region.link || region.email || region.phoneNumber ? (
                  <div>
                    {region.link ? (
                      <Paragraph ellipsis>
                        <b>Посилання:</b>{" "}
                        <u>
                          <a
                            href={region.link}
                            target="_blank"
                            className="link"
                          >
                            {region.link}
                          </a>
                        </u>
                      </Paragraph>
                    ) : null}
                    {region.phoneNumber ? (
                      <Paragraph>
                        <b>Телефон:</b> {region.phoneNumber}
                      </Paragraph>
                    ) : null}
                    {region.email ? (
                      <Paragraph>
                        <b>Пошта:</b> {region.email}
                      </Paragraph>
                    ) : null}
                  </div>
                ) : (
                  <Paragraph>
                    <b>Немає контактів</b>
                  </Paragraph>
                )}
              </Col>
            </Row>
            <Row className="cityButtons" justify="center" gutter={[12, 0]}>
              <Col>
                <Button
                  type="primary"
                  className="cityInfoButton"
                  onClick={() => setVisibleDrawer(true)}
                >
                  Деталі
                </Button>
              </Col>
              {userAccesses["EditRB"] ? (
                <>
                  <Col
                    style={{ display: userAccesses["EditRB"] ? "block" : "none" }}
                  />
                  <Col
                    xs={24}
                    sm={4}
                    style={{ display: userAccesses["EditRB"] ? "block" : "none" }}
                  >
                    <Row
                      className="cityIcons"
                      justify={userAccesses["EditRB"] ? "center" : "start"}
                    >
                      <Col>
                        <Tooltip title="Крайовий Провід Пласту">
                          <EditOutlined
                            className="cityInfoIcon"
                            onClick={() => history.push(`/regionsBoard/edit`)}
                          />
                        </Tooltip>
                      </Col>
                    </Row>
                  </Col>
                </>
              ) : null}
            </Row>
          </Card>
        </Col>
        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
          <Card hoverable className="cityCard">
            <Title level={4}>Опис</Title>
            <Row className="cityItems" justify="center" gutter={[0, 16]}>
              <div className="regionDesc">{region.description}</div>
            </Row>
          </Card>
        </Col>
        <Col
          xl={{ span: 7, offset: 0 }}
          md={{ span: 11, offset: 2 }}
          sm={24}
          xs={24}
        >
          <Card hoverable className="cityCard">
            <Title level={4}>
              Керівні Органи{" "}
              <a onClick={() => history.push(`/regionsBoard/governingBodies`)}>
                {governingBodies.length !== 0 ? (
                  <Badge
                    count={orgsCount}
                    style={{ backgroundColor: "#3c5438" }}
                  />
                ) : null}
              </a>
            </Title>
            <Row className="cityItems" justify="center" gutter={[0, 16]}>
              {governingBodies.length !== 0 ? (
                governingBodies.map((governingBody) => (
                  <Col
                    className="cityMemberItem"
                    key={governingBody.id}
                    xs={12}
                    sm={8}
                  >
                    <div
                      onClick={() => history.push(`/governingBodies/${governingBody.id}`)}
                    >
                      {gbPhotosAreLoading ? (
                        <Skeleton.Avatar active size={64} />
                      ) : (
                        <Avatar size={64} src={governingBody.logo == null ? CityDefaultLogo : governingBody.logo} />
                      )}
                      <p className="userName">
                        {governingBody.governingBodyName}
                      </p>
                    </div>
                  </Col>
                ))
              ) : (
                <Paragraph>Ще немає керівних органів</Paragraph>
              )}
            </Row>
            <div className="cityMoreButton">
              {userAccesses["CreateGB"] ? (
                <PlusSquareFilled
                  type="primary"
                  className="addReportIcon"
                  onClick={() => history.push(`/regionsBoard/new`)}
                />
              ) : null}
              <Button
                type="primary"
                className="cityInfoButton"
                onClick={() => history.push(`/regionsBoard/governingBodies`)}
              >
                Більше
              </Button>
            </div>
          </Card>
        </Col>

        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
        <Card hoverable className="cityCard">
            <Title level={4}>
                Рішення{" "}
                <a onClick={() => history.push(`/decisions`)}>
                {decisions.length !== 0 ? (
                    <Badge
                    count={decisionsCount}
                    style={{ backgroundColor: "#3c5438" }}
                    />
                    ) : null}
                </a>
            </Title>
            {userAccesses["ViewDecisions"] ? 
              <>
                <Row className="cityItems" justify="center" gutter={[0, 16]}>
                    {decisions.length !== 0 ? (
                    decisions.map((decision) => (
                        <Col
                        className="cityMemberItem"
                        xs={12}
                        sm={8}
                        key={decision.id}
                        onClick={() => openPDF(decision)}
                        >
                        <div>
                            <FileDoneOutlined className="documentIcon" />
                            <p className="documentText">{decision.name}</p>
                        </div>
                        </Col>
                    ))
                    ) : (
                    <Paragraph>Ще немає рішень</Paragraph>
                    )}
                </Row>
              </>
            :  <>
                 <Paragraph strong>У тебе немає доступу до рішень!</Paragraph>
                 <LockOutlined style={{ fontSize:"150px" }} />
               </>
            }
          <div className="cityMoreButton">
            {userAccesses["AddDecision"] ? (
              <PlusSquareFilled
                type="primary"
                className="addReportIcon"
                onClick={() => setVisibleDecisionModal(true)}
              />
            ) : null}
            {userAccesses["ViewDecisions"] ? (<Button
              type="primary"
              className="cityInfoButton"
              onClick={() => history.push(`/decisions`)}
              disabled={!userAccesses["ViewDecisions"]}
            >
              Більше
            </Button>) : null}
          </div>
        </Card>
      </Col>

        <Col
          xl={{ span: 7, offset: 1 }}
          md={{ span: 11, offset: 2 }}
          sm={24}
          xs={24}
        >
          <Card hoverable className="cityCard">
            <Title level={4}>Документообіг <a onClick={() => history.push('/regionsBoard/documents/' + region.id)}>
              {documents.length !== 0 ? (
                <Badge
                  count={documents.length}
                  style={{ backgroundColor: "#3c5438" }}
                />
              ) : null}
            </a></Title>
            <Row className="cityItems" justify="center" gutter={[0, 16]}>
              {documents.length !== 0 ? (
                documents.map((document) => (
                  <Col
                    className="cityDocumentItem"
                    xs={12}
                    sm={8}
                    key={document.id}
                  >
                    <div>
                      <FileTextOutlined className="documentIcon" />
                      <p className="documentText">{document.fileName}</p>
                    </div>
                  </Col>
                ))
              ) : (
                <Paragraph>Ще немає документів</Paragraph>
              )}
            </Row>
            <div className="cityMoreButton">
              <Button
                type="primary"
                className="cityInfoButton"
                onClick={() =>
                  history.push(`/regionsBoard/documents/${region.id}`)
                }
              >
                Більше
              </Button>
              {userAccesses["ManipulateDocument"] ? (
                <PlusSquareFilled
                  className="addReportIcon"
                  onClick={() => setVisibleModal(true)}
                />
              ) : null}
            </div>
          </Card>
        </Col>
      </Row>

      <AddDocumentModal
        regionId={region.id}
        document={document}
        setDocument={setDocument}
        visibleModal={visibleModal}
        setVisibleModal={setVisibleModal}
        onAdd={onAdd}
      />
      <AddDecisionModal
        setVisibleModal={setVisibleDecisionModal}
        visibleModal={visibleDecisionModal}
        onAdd={handleAdd}
      />
      <RegionDetailDrawer
        region={region}
        setVisibleDrawer={setVisibleDrawer}
        visibleDrawer={visibleDrawer}
      />
    </Layout.Content>
  );
};

export default RegionBoard;
