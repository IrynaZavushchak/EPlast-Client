import React, { useEffect, useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { Avatar, Row, Col, Button, Spin, Layout, Modal, Skeleton, Divider, Card, Tooltip, Badge } from "antd";
import { FileTextOutlined, EditOutlined, PlusSquareFilled, UserAddOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import moment from "moment";
import { addFollower, getClubById, getLogo, removeClub, toggleMemberStatus, clubNameOfApprovedMember } from "../../../api/clubsApi";
import userApi from "../../../api/UserApi";
import "./Club.less";
import ClubDefaultLogo from "../../../assets/images/default_club_image.jpg";
import ClubProfile from "../../../models/Club/ClubProfile";
import ClubMember from '../../../models/Club/ClubMember';
import ClubAdmin from '../../../models/Club/ClubAdmin';
import ClubDocument from '../../../models/Club/ClubDocument';
import AddDocumentModal from "../AddDocumentModal/AddDocumentModal";
import Title from "antd/lib/typography/Title";
import Paragraph from "antd/lib/typography/Paragraph";
import Spinner from "../../Spinner/Spinner";
import ClubDetailDrawer from "../ClubDetailDrawer/ClubDetailDrawer";
import NotificationBoxApi from "../../../api/NotificationBoxApi";
import Crumb from "../../../components/Breadcrumb/Breadcrumb";
import PsevdonimCreator from "../../../components/HistoryNavi/historyPseudo";
import AddClubsNewSecretaryForm from "../AddAdministratorModal/AddClubsSecretaryForm";
import { Roles } from "../../../models/Roles/Roles";


const Club = () => {
  const history = useHistory();
  const { id } = useParams();
  const { url } = useRouteMatch();

  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState<ClubProfile>(new ClubProfile());
  const [clubLogo64, setClubLogo64] = useState<string>("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [visible, setvisible] = useState<boolean>(false);
  const [admins, setAdmins] = useState<ClubAdmin[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [followers, setFollowers] = useState<ClubMember[]>([]);
  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [membersCount, setMembersCount] = useState<number>();
  const [adminsCount, setAdminsCount] = useState<number>();
  const [followersCount, setFollowersCount] = useState<number>();
  const [documentsCount, setDocumentsCount] = useState<number>();
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);
  const [clubLogoLoading, setClubLogoLoading] = useState<boolean>(false);
  const [document, setDocument] = useState<ClubDocument>(new ClubDocument());
  const [activeUserClub, setActiveUserClub] = useState<string>();

  const changeApproveStatus = async (memberId: number) => {
    const member = await toggleMemberStatus(memberId);

    await NotificationBoxApi.createNotifications(
      [member.data.userId],
      "Вітаємо, вас зараховано до членів куреня: ",
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/clubs/${id}`,
      club.name
    );

    member.data.user.imagePath = (
      await userApi.getImage(member.data.user.imagePath)
    ).data;
    const response = await getClubById(+id);
    setFollowersCount(response.data.followerCount);
    setMembersCount(response.data.memberCount);
    if (members.length < 9) {
      setMembers([...members, member.data]);
    }

    setFollowers(followers.filter((f) => f.id !== memberId));
  };

  const addMember = async () => {
    const follower = await addFollower(+id);

    await NotificationBoxApi.createNotifications(
      admins.map(ad => ad.userId),
      `Приєднався новий прихильник: ${follower.data.user.firstName} ${follower.data.user.lastName} до вашого куреня: `,
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/clubs/followers/${id}`,
      `${club.name}`
    );
    follower.data.user.imagePath = (
      await userApi.getImage(follower.data.user.imagePath)
    ).data;
    const response = await getClubById(+id);
    setFollowersCount(response.data.followerCount);
    if (followers.length < 6) {
      setFollowers([...followers, follower.data]);
    }

    setCanJoin(false);
  };

  const deleteClub = async () => {
    await removeClub(club.id);

    admins.map(async (ad) => {
      await NotificationBoxApi.createNotifications(
        [ad.userId],
        `На жаль курінь: '${club.name}', в якому ви займали роль: '${ad.adminType.adminTypeName}' було видалено`,
        NotificationBoxApi.NotificationTypes.UserNotifications
      );
    });
    history.push('/clubs');
  }

  const setPhotos = async (members: ClubMember[], logo: string) => {
    for (let i = 0; i < members.length; i++) {
      members[i].user.imagePath = (
        await userApi.getImage(members[i].user.imagePath)
      ).data;
    }
    setPhotosLoading(false);

    if (logo === null) {
      setClubLogo64(ClubDefaultLogo);
    } else {
      const response = await getLogo(logo);
      setClubLogo64(response.data);
    }
    setClubLogoLoading(false);
  };

  const onAdd = async (newDocument: ClubDocument) => {
    const response = await getClubById(+id);
    setDocumentsCount(response.data.documentsCount);
    if (documents.length < 6) {
      setDocuments([...documents, newDocument]);
    }
  }

  function seeDeleteModal() {
    return Modal.confirm({
      title: "Ви впевнені, що хочете видалити даний курінь?",
      icon: <ExclamationCircleOutlined />,
      okText: 'Так, видалити',
      okType: 'danger',
      cancelText: 'Скасувати',
      maskClosable: true,
      onOk() { deleteClub() }
    });
  }

  function seeJoinModal() {
    return Modal.confirm({
      title: "Ви впевнені, що хочете доєднатися до даного куреня?",
      icon: <ExclamationCircleOutlined />,
      okText: 'Так, доєднатися',
      okType: 'primary',
      cancelText: 'Скасувати',
      maskClosable: true,
      onOk() { addMember() }
    });
  }

  const getClub = async () => {
    setLoading(true);

    try {
      const response = await getClubById(+id);
      const response1 = await clubNameOfApprovedMember(userApi.getActiveUserId());
      setActiveUserClub(response1.data);
      setPhotosLoading(true);
      setClubLogoLoading(true);
      const admins = [...response.data.administration, response.data.head, response.data.headDeputy]
        .filter(a => a !== null);

      setPhotos([
        ...admins,
        ...response.data.members,
        ...response.data.followers,

      ], response.data.logo);

      setActiveUserRoles(userApi.getActiveUserRoles);
      setAdmins(admins);
      setClub(response.data);
      setMembers(response.data.members);
      setFollowers(response.data.followers);
      setDocuments(response.data.documents);
      setCanCreate(response.data.canCreate);
      setCanEdit(response.data.canEdit);
      setCanJoin(response.data.canJoin);
      setMembersCount(response.data.memberCount);
      setAdminsCount(response.data.administrationCount);
      setFollowersCount(response.data.followerCount)
      setDocumentsCount(response.data.documentsCount);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOk = async() => {
    const response =  await getClubById(+id);
    const admins = [...response.data.administration, response.data.head, response.data.headDeputy]
    .filter(a => a !== null);
    setAdmins(admins);
    setPhotosLoading(true);
    setAdminsCount(response.data.administrationCount);
    setPhotos([...admins,], response.data.logo);
    setvisible(false);
  };

  useEffect(() => {
    getClub();
  }, []);

  useEffect(() => {
    if (club.name.length != 0) {
      PsevdonimCreator.setPseudonimLocation(`clubs/${club.name}`, `clubs/${id}`);
    }
  }, [club])

  return loading ? (
    <Spinner />
  ) : club.id !== 0 ? (
    <Layout.Content className="clubProfile">
      <Row gutter={[0, 48]}>
        <Col xl={15} sm={24} xs={24}>
          <Card hoverable className="clubCard">
            <div>
              <Crumb
                current={club.name}
                first="/"
                second={url.replace(`/${id}`, "")}
                second_name="Курені"
              />
            </div>
            <Title level={3}>Курінь {club.name}</Title>
            <Row className="clubPhotos" gutter={[0, 12]}>
              <Col md={13} sm={24} xs={24}>
                {clubLogoLoading ? (
                  <Skeleton.Avatar active shape={"square"} size={172} />
                ) : (
                    <img src={clubLogo64} alt="Club" className="clubLogo" />
                  )}
              </Col>
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>

                <div>
                  <Title level={4}>Опис куреня</Title>
                  {club.description.length != 0 ? (
                    <Paragraph>
                      <b>{club.description}</b>

                    </Paragraph>

                  ) : (
                      <Paragraph>
                        <b>Ще немає опису куреня.</b>

                      </Paragraph>
                    )}
                </div>
              </Col>
            </Row>
            <Row className="clubInfo">
              <Col md={13} sm={24} xs={24}>
                {club.head ? (
                  <div>
                    <Paragraph>
                      <b>Голова Куреня:</b> {club.head.user.firstName}{" "}
                      {club.head.user.lastName}
                    </Paragraph>
                    <Paragraph>
                      {club.head.endDate === null ?
                        (<div>
                          <b>Початок правління:</b>
                          {` ${moment(club.head.startDate).format("DD.MM.YYYY")}`}
                        </div>
                        )
                        :
                        (<div>
                          <b>Термін правління:</b>
                          {` ${moment(club.head.startDate).format("DD.MM.YYYY")} - ${moment(club.head.endDate).format("DD.MM.YYYY")}`}
                        </div>
                        )
                      }
                    </Paragraph>
                  </div>
                ) : (
                    <Paragraph>
                      <b>Немає голови куреня</b>
                    </Paragraph>
                  )}
                  {club.headDeputy ? (
                  <div>
                    <Paragraph>
                      <b>Заступник Голови Куреня:</b> {club.headDeputy.user.firstName}{" "}
                      {club.headDeputy.user.lastName}
                    </Paragraph>
                    <Paragraph>
                      {club.headDeputy.endDate === null ?
                        (<div>
                          <b>Початок правління:</b>
                          {` ${moment(club.headDeputy.startDate).format("DD.MM.YYYY")}`}
                        </div>
                        )
                        :
                        (<div>
                          <b>Термін правління:</b>
                          {` ${moment(club.headDeputy.startDate).format("DD.MM.YYYY")} - ${moment(club.headDeputy.endDate).format("DD.MM.YYYY")}`}
                        </div>
                        )
                      }
                    </Paragraph>
                  </div>
                ) : (
                    <Paragraph>
                      <b>Немає заступника голови куреня</b>
                    </Paragraph>
                  )}
              </Col>
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                {club.clubURL || club.email || club.phoneNumber ? (
                  <div>
                    {club.street ? (
                      <Paragraph>
                        <b>Гасло:</b> {club.street}
                      </Paragraph>
                    ) : null}
                    {club.clubURL ? (
                      <Paragraph
                        ellipsis>
                        <b>Посилання:</b>{" "}
                        <u><a href={club.clubURL} target="_blank">
                          {club.clubURL}
                        </a></u>
                      </Paragraph>
                    ) : null}
                    {club.phoneNumber ? (
                      <Paragraph>
                        <b>Телефон:</b> {club.phoneNumber}
                      </Paragraph>
                    ) : null}
                    {club.email ? (
                      <Paragraph>
                        <b>Пошта:</b> {club.email}
                      </Paragraph>
                    ) : null}
                  </div>
                ) : (
                    <Paragraph>
                      <b>Немає інформації</b>
                    </Paragraph>
                  )}
              </Col>
            </Row>
            <Row className="clubButtons" justify="center" gutter={[12, 0]}>
              <Col>
                <Button
                  type="primary"
                  className="clubInfoButton"
                  onClick={() => setVisibleDrawer(true)}
                >
                  Деталі
                </Button>
              </Col>
              {canEdit ? (
                <Col>
                  <Button
                    type="primary"
                    className="clubInfoButton"
                    onClick={() => history.push(`/annualreport/table/hovel`)}
                  >
                    Річні звіти
                  </Button>
                </Col>
              ) : null}
              {canEdit ? (
                <Col xs={24} sm={4}>
                  <Row
                    className="clubIcons"
                    justify={canCreate ? "center" : "start"}
                  >
                    {canEdit ? (
                      <Col>
                        <Tooltip
                          title="Редагувати курінь">
                          <EditOutlined
                            className="clubInfoIcon"
                            onClick={() =>
                              history.push(`/clubs/edit/${club.id}`)
                            }
                          />
                        </Tooltip>
                      </Col>
                    ) : null}
                    {canCreate ? (
                      <Col offset={1}>
                        <Tooltip
                          title="Видалити курінь">
                          <DeleteOutlined
                            className="clubInfoIconDelete"
                            onClick={() => seeDeleteModal()}
                          />
                        </Tooltip>
                      </Col>
                    ) : null}
                  </Row>
                </Col>
              ) : null}
            </Row>
          </Card>
        </Col>

        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
          <Card hoverable className="clubCard">
            <Title level={4}>Члени куреня <a onClick={() => history.push(`/clubs/members/${club.id}`)}>
              {membersCount !== 0 ?
                <Badge
                  count={membersCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {members.length !== 0 ? (
                members.map((member) => (
                  <Col
                    className="clubMemberItem"
                    key={member.id}
                    xs={12}
                    sm={8}
                  >
                    <div
                      onClick={() =>
                        history.push(`/userpage/main/${member.userId}`)
                      }
                    >
                      {photosLoading ? (
                        <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                      ) : (
                          <Avatar size={64} src={member.user.imagePath} />
                        )}
                      <p className="userName">{member.user.firstName}</p>
                      <p className="userName">{member.user.lastName}</p>
                    </div>
                  </Col>
                ))
              ) : (
                  <Paragraph>Ще немає членів куреня</Paragraph>
                )}
            </Row>
            <div className="clubMoreButton">
              <Button
                type="primary"
                className="clubInfoButton"
                onClick={() => history.push(`/clubs/members/${club.id}`)}
              >
                Більше
              </Button>
            </div>
          </Card>
        </Col>

        <Col
          xl={{ span: 7, offset: 0 }}
          md={{ span: 11, offset: 2 }}
          sm={24}
          xs={24}
        >
          <Card hoverable className="clubCard">
            <Title level={4}>Провід куреня <a onClick={() => history.push(`/clubs/administration/${club.id}`)}>
              {adminsCount !== 0 ?
                <Badge
                  count={adminsCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {admins.length !== 0 ? (
                admins.map((admin) => (
                  <Col className="clubMemberItem" key={admin.id} xs={12} sm={8}>
                    <div
                      onClick={() =>
                        history.push(`/userpage/main/${admin.userId}`)
                      }
                    >
                      {photosLoading ? (
                        <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                      ) : (
                          <Avatar size={64} src={admin.user.imagePath} />
                        )}
                      <p className="userName">{admin.user.firstName}</p>
                      <p className="userName">{admin.user.lastName}</p>
                    </div>
                  </Col>
                ))
              ) : (
                  <Paragraph>Ще немає діловодів куреня</Paragraph>
                )}
            </Row>
            <div className="clubMoreButton">
            {canEdit ? (
              <PlusSquareFilled
                type="primary"
                className="addReportIcon"
                onClick={() => setvisible(true)}
              />
              ) : null}
              <Button
                type="primary"
                className="clubInfoButton"
                onClick={() =>
                  history.push(`/clubs/administration/${club.id}`)
                }
              >
                Більше
              </Button>
            </div>
          </Card>
        </Col>

        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
          <Card hoverable className="clubCard">
            <Title level={4}>Документообіг куреня <a onClick={() => 
            canEdit || (!activeUserRoles.includes(Roles.RegisteredUser)  
            && club.name == activeUserClub) ||
            (activeUserRoles.includes(Roles.CityHead)|| activeUserRoles.includes(Roles.CityHeadDeputy))
            ||
            (activeUserRoles.includes(Roles.KurinHead)|| activeUserRoles.includes(Roles.KurinHeadDeputy))
              ?
              history.push(`/clubs/documents/${club.id}`)
              : undefined
              }>
              {documentsCount !== 0 ?
                <Badge
                  count={documentsCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a></Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {documents.length !== 0 ? (
                documents.map((document) => (
                  <Col
                    className="clubDocumentItem"
                    xs={12}
                    sm={8}
                    key={document.id}
                  >
                    <div>
                      <FileTextOutlined className="documentIcon" />
                      <p className="documentText">
                        {document.clubDocumentType.name}
                      </p>
                    </div>
                  </Col>
                ))
              ) : (
                  <Paragraph>Ще немає документів куреня</Paragraph>
                )}
            </Row>
            <div className="clubMoreButton">
            {canEdit || (!activeUserRoles.includes(Roles.RegisteredUser) 
              && club.name == activeUserClub) ||
              (activeUserRoles.includes(Roles.CityHead)|| activeUserRoles.includes(Roles.CityHeadDeputy))
              ||
              (activeUserRoles.includes(Roles.KurinHead)|| activeUserRoles.includes(Roles.KurinHeadDeputy))
                ? (
             <Button
                type="primary"
                className="clubInfoButton"
                onClick={() => history.push(`/clubs/documents/${club.id}`)}
              >
                Більше
              </Button>
                ): null}
                {(activeUserRoles.includes(Roles.Admin)) || (activeUserRoles.includes(Roles.KurinHead)|| activeUserRoles.includes(Roles.KurinHeadDeputy)
                && club.name == activeUserClub)? (
                <PlusSquareFilled
                  className="addReportIcon"
                  onClick={() => setVisibleModal(true)}
                />
                 ):null}
            </div>
          </Card>
        </Col>

        <Col
          xl={{ span: 7, offset: 1 }}
          md={{ span: 11, offset: 2 }}
          sm={24}
          xs={24}
        >
          <Card hoverable className="clubCard">
            <Title level={4}>Прихильники куреня <a onClick={() => history.push(`/clubs/followers/${club.id}`)}>
              {followersCount !== 0 ?
                <Badge
                  count={followersCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {canJoin ? (
                <Col
                  className="clubMemberItem"
                  xs={12}
                  sm={8}
                  onClick={() => seeJoinModal()}
                >
                  <div>
                    <Avatar
                      className="addFollower"
                      size={64}
                      icon={<UserAddOutlined />}
                    />
                    <p>Доєднатися</p>
                  </div>
                </Col>
              ) : null}
              {followers.length !== 0 ? (
                followers.slice(0, canJoin ? 5 : 6).map((followers) => (
                  <Col
                    className="clubMemberItem"
                    xs={12}
                    sm={8}
                    key={followers.id}
                  >
                    <div>
                      <div
                        onClick={() =>
                          history.push(`/userpage/main/${followers.userId}`)
                        }
                      >
                        {photosLoading ? (
                          <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                        ) : (
                            <Avatar size={64} src={followers.user.imagePath} />
                          )}
                        <p className="userName">{followers.user.firstName}</p>
                        <p className="userName">{followers.user.lastName}</p>
                      </div>
                      {canEdit ? (
                        <PlusOutlined
                          className="approveIcon"
                          onClick={() => changeApproveStatus(followers.id)}
                        />
                      ) : null}
                    </div>
                  </Col>
                ))
              ) : canJoin ? null : (
                <Paragraph>Ще немає прихильників куреня</Paragraph>
              )}
            </Row>
            <div className="clubMoreButton">
              <Button
                type="primary"
                className="clubInfoButton"
                onClick={() => history.push(`/clubs/followers/${club.id}`)}
              >
                Більше
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <Modal
        title="Додати діловода"
        visible={visible}
        onOk={handleOk}
        onCancel={handleOk}
        footer={null}
      >
        <AddClubsNewSecretaryForm
          onAdd={handleOk}
          clubId={+id}
          visibleModal={visible}>
        </AddClubsNewSecretaryForm>
      </Modal>
      <ClubDetailDrawer
        Club={club}
        setVisibleDrawer={setVisibleDrawer}
        visibleDrawer={visibleDrawer}
      ></ClubDetailDrawer>

      {canEdit ? (
        <AddDocumentModal
          ClubId={+id}
          document={document}
          setDocument={setDocument}
          visibleModal={visibleModal}
          setVisibleModal={setVisibleModal}
          onAdd={onAdd}
        ></AddDocumentModal>
      ) : null}
    </Layout.Content>
  ) : (
        <Title level={2}>Місто не знайдено</Title>
      );
};

export default Club;
