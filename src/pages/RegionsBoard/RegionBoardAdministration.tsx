import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Avatar, Button, Card, Layout, Modal, Skeleton } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import "../Regions/Region.less";
import moment from "moment";
import "moment/locale/uk";
import Title from "antd/lib/typography/Title";
import Spinner from "../Spinner/Spinner";
import { getGoverningBodiesList, getGoverningBodyLogo } from "../../api/governingBodiesApi";
import { GoverningBody } from "../../api/decisionsApi";
import CityDefaultLogo from "../../assets/images/default_city_image.jpg";
moment.locale("uk-ua");

const RegionBoardAdministration = () => {
  const history = useHistory();

  const [governingBodies, setGoverningBodies] = useState<GoverningBody[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const setPhotos = async (governingBodies: GoverningBody[]) => {
    for (let i = 0; i < governingBodies.length; i++) {
      if (governingBodies[i].logo == undefined) continue;
      governingBodies[i].logo = (
        await getGoverningBodyLogo(governingBodies[i].logo!)
      ).data;
    }
 
    setPhotosLoading(false);
  };

  const getGoverningBodies = async () => {
    setLoading(true);
    const responseOrgs = await getGoverningBodiesList();
    setGoverningBodies(responseOrgs);
    setPhotosLoading(true);
    setPhotos(responseOrgs);
    setLoading(false);
  };

  const handleOk = () => {
    setVisibleModal(false);
  };

  useEffect(() => {
    getGoverningBodies();
  }, []);

  return (
    <Layout.Content>
      <Title level={2}>Керівні органи Крайового Проводу</Title>
      {loading ? (
        <Spinner />
      ) : (
        <div className="cityMoreItems">
          {governingBodies.length > 0 ? (
            governingBodies.map((governingBody) => (
              <Card
                key={governingBody.id}
                className="detailsCard"
                title={`${governingBody.governingBodyName}`}
                headStyle={{ backgroundColor: "#3c5438", color: "#ffffff" }}
              >
                <div className="cityMember">
                  <div 
                    onClick={() => history.push(`/governingBodies/${governingBody.id}`)}
                  >
                    {photosLoading ? (
                      <Skeleton.Avatar active size={86} />
                    ) : (
                      <Avatar size={86} src={governingBody.logo == undefined ? CityDefaultLogo : governingBody.logo} />
                    )}
                    <Card.Meta
                      className="detailsMeta"
                      title={`${governingBody.governingBodyName}`}
                    />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Title level={4}>Ще немає керівних органів Крайового Проводу</Title>
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

      <Modal
        title="Редагувати діловода"
        visible={visibleModal}
        onOk={handleOk}
        onCancel={handleOk}
        footer={null}
      />
    </Layout.Content>
  );
};

export default RegionBoardAdministration;
