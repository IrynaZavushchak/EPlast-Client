import React, { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { Avatar, Layout, Menu, Button } from "antd";
import { BankOutlined, RollbackOutlined } from "@ant-design/icons";
import {
  SolutionOutlined,
  InfoCircleOutlined,
  SnippetsOutlined,
  PieChartOutlined,
  FileTextOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import classes from "./PrivateLayout.module.css";
import jwt from 'jwt-decode';
import AuthStore from '../../stores/AuthStore';
import { Roles } from "../../models/Roles/Roles";
import useOnClickOutside from "./useOneClickOutside";
import { User } from "../../pages/userPage/Interface/Interface";
import UserApi from "../../api/UserApi";

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

const PrivateLayout = ({ children }: any) => {
  const [collapsed, setCollapsed] = useState(true);
  const history = useHistory();
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>();
  const [canEdit, setCanEdit] = useState(false);
  const [canSee, setCanSee] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [regionAdm, setRegionAdm] = useState(false);
  const [regionAdmDeputy, setRegionAdmDeputy] = useState(false);
  const [cityAdm, setCityAdm] = useState(false);
  const [cityAdmDeputy, setCityAdmDeputy] = useState(false);
  const [clubAdm, setClubAdm] = useState(false);
  const [clubAdmDeputy, setClubAdmDeputy] = useState(false);
  const [id, setId] = useState<string>("");
  const [onlyRegistered, setOnlyRegistered] = useState(false);
  const [activeUserProfile, setActiveUserProfile] = useState<User>();
  const [plastMember, setPlastMember] = useState(false);
  const ref = useRef(null)

  const handleClickOutside = () => {
    setCollapsed(true);
  }
  useOnClickOutside(ref, handleClickOutside)


  const onCollapse = (collValue: boolean) => {
    setCollapsed(collValue);
  };

  const handleClickAway = () => {
    setCollapsed(true);
  };

  const [imageBase64, setImageBase64] = useState<string>();
  const fetchData = async () => {
    const token = AuthStore.getToken() as string;
    if (token == null) {
      const str = window.location.pathname
      if (str !== "/signin") {
        localStorage.setItem('pathName', str);
      }
      history.push("/signin");
    }
    else {
      const user: any = jwt(token);
      await UserApi.getById(user.nameid).then(async response => {
        await UserApi.getImage(response.data.user.imagePath).then((response: { data: any; }) => {
          setImageBase64(response.data);
        })
        setId(response.data.user.id);
      })
    }
  };

  const fetchUser = async () => {
    let roles = UserApi.getActiveUserRoles();
      setActiveUserRoles(roles);
      setCanEdit(roles.includes(Roles.Admin));
      setRegionAdm(roles.includes(Roles.OkrugaHead));
      setRegionAdmDeputy(roles.includes(Roles.OkrugaHeadDeputy));
      setCityAdm(roles.includes(Roles.CityHead));
      setCityAdmDeputy(roles.includes(Roles.CityHeadDeputy));
      setClubAdm(roles.includes(Roles.KurinHead));
      setClubAdmDeputy(roles.includes(Roles.KurinHeadDeputy));
      setCanSee(roles.includes(Roles.PlastMember));
      setCanAccess(roles.includes(Roles.Supporter));
      setOnlyRegistered(roles.includes(Roles.RegisteredUser));
      setPlastMember(roles.includes(Roles.PlastMember));
    let userProfile = await UserApi.getActiveUserProfile();
      setActiveUserProfile(userProfile);
  }

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  return (
    <Layout style={{ minHeight: "calc(100vh-64px-82px)" }}>
    <div ref={ref}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          className={classes.sidebar}
          breakpoint="xxl"
          width="250"
          collapsedWidth="0"
        >
          <div className={classes.profilePhoto}>
            <Link to={`/userpage/main/${id}`}>
              <Avatar
                size={64}
                src={imageBase64}
                alt="User"
                style={{ marginRight: "10px" }}
              /></Link>
          </div>
          <Menu theme="dark" mode="inline" className={classes.leftMenu}>
            {(canEdit || canSee  || regionAdm  || regionAdmDeputy || cityAdm || cityAdmDeputy || clubAdm || clubAdmDeputy) ? (
              <Menu.Item
                key="0"
                icon={<SolutionOutlined />}
                onClick={() => { handleClickAway(); history.push("/decisions"); }}
                style={{ color: "white" }}
              >
                Рішення
              </Menu.Item>
              ) : (<> </>)
            }
            {activeUserProfile?.city ? (
              <Menu.Item
                key="1"
                icon={<BankOutlined />}
                onClick={() => { handleClickAway(); history.push("/regionsBoard"); }}
                style={{ color: "white" }}
              >
                Крайовий Провід Пласту
              </Menu.Item>
              ) : (<> </>)
            }
            
            <SubMenu key="sub1" icon={<InfoCircleOutlined />} title="Довідник">
              {(canEdit || canSee || regionAdm || regionAdmDeputy || cityAdm || cityAdmDeputy || clubAdm || clubAdmDeputy || plastMember) ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push("/user/table"); }} key="2">
                  Таблиця користувачів
                </Menu.Item>
                ) : (<> </>)
              }
              {activeUserProfile?.city ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push("/regions"); }} key="3" >
                  Округи                  
                </Menu.Item>
                ) : (<> </>)
              }
              <Menu.Item onClick={() => { handleClickAway(); history.push("/cities"); }} key="4">
                Станиці
              </Menu.Item>
              {(canEdit || canSee || canAccess || regionAdm || regionAdmDeputy || cityAdm || cityAdmDeputy || clubAdm || clubAdmDeputy) ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push('/clubs'); }} key="5">
                  Курені
                </Menu.Item>
                ) : (<> </>)
              }
              {activeUserProfile?.city ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push('/events/types'); }} key="6">
                  Події
                </Menu.Item>
                ) : (<> </>)
              }
              {(canEdit || canSee || canAccess || regionAdm || regionAdmDeputy || cityAdm || cityAdmDeputy || clubAdm || clubAdmDeputy) ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push('/distinctions'); }} key="7">
                  Відзначення
                </Menu.Item>
                ) : (<> </>)
              }
              {(canEdit || canSee || canAccess || regionAdm || regionAdmDeputy || cityAdm || cityAdmDeputy || clubAdm || clubAdmDeputy) ? (
                <Menu.Item onClick={() => {
                  handleClickAway();
                  history.push('/precautions');
                }} key="15">
                  Перестороги
                </Menu.Item>
                ) : (<> </>)
              }
              {(canEdit || canSee || canAccess || regionAdm || regionAdmDeputy || cityAdm || cityAdmDeputy || clubAdm || clubAdmDeputy) ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push('/kadra'); }} key="8">
                  Кадра виховників
                </Menu.Item>)
                : (<> </>)
              }
              {(canEdit || canSee || canAccess || regionAdm || cityAdm || clubAdm || activeUserProfile?.city) ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push('/legislation'); }} key="14">
                  Репозитарій
                </Menu.Item>)
                : (<> </>)
              }
            </SubMenu>

            {(canEdit || regionAdm || regionAdmDeputy || cityAdm || cityAdmDeputy) ? (
              <SubMenu key="sub2" icon={<SnippetsOutlined />} title="Звітування та Статистика">
                <Menu.Item icon={<FileTextOutlined />} onClick={() => { handleClickAway(); history.push(`/annualreport/table/city`); }} key="9">
                  Річні звіти
                </Menu.Item>
                <SubMenu
                  key="sub2.1"
                  icon={<PieChartOutlined />}
                  title="Статистика" >
                  <Menu.Item icon={<BarChartOutlined />} onClick={() => { handleClickAway(); history.push('/statistics/cities'); }} key="10">
                    Статистика станиць
                  </Menu.Item>
                  <Menu.Item icon={<BarChartOutlined />} onClick={() => { handleClickAway(); history.push('/statistics/regions'); }} key="11">
                    Статистика округ
                  </Menu.Item>
                </SubMenu>
                {/* <SubMenu key="sub2.3" title="Осередки">
                  <Menu.Item onClick={() => { handleClickAway(); }} key="12">Осередки та адміни</Menu.Item>
                  <Menu.Item onClick={() => { handleClickAway(); }} key="13">Порівняти осередки</Menu.Item>
                </SubMenu> */}
              </SubMenu>
              ) : (<> </>)
            }

            {(canEdit === true || canSee === true || canAccess === true || regionAdm === true || cityAdm === true || clubAdm === true) ? (
                <Menu.Item onClick={() => { handleClickAway(); history.push('/aboutBase'); }} key="5">Про Базу</Menu.Item>) : (<> </>)

            {(!canEdit && !regionAdm && !cityAdm && clubAdm) ? (
              <Menu.Item icon={<FileTextOutlined />} onClick={() => { handleClickAway(); history.push(`/annualreport/table/city`); }} key="9">
                Річні звіти
              </Menu.Item>
              ) : (<> </>)
            }
          </Menu>
        </Sider>
      </div>
      <Layout className="site-layout">
        <Content style={{ margin: "0 16px" }} key="content">
          <div
            className="site-layout-background"
            style={{ padding: 20, minHeight: 360 }}
          >
            {children}
          </div>
        </Content>
      </Layout>
      <div>
        <Button icon={<RollbackOutlined />}
          className={classes.backButton}
          size={"large"}
          onClick={() => history.goBack()}
          type="primary"
          style={{}}
        ></Button>
      </div>
    </Layout >
  );
};

export default PrivateLayout;