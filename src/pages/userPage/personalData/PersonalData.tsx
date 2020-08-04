import React from 'react';
import Menu from '../Menu/Menu';
import styles from './PersonalData.module.css';
import UserFields from './UserFields';
import EditUserPage from '../EditUserPage/EditUserPage';
import Approvers from '../Approvers/Approvers';
import {useParams} from 'react-router-dom';


export default function (
  {
  match: {
    params: { specify },
  },
}: any) {
  const {userId}=useParams(); 
  return (
    <div className={styles.mainContainer}>
      <Menu id={userId}/>
      {specify === 'main' ? (
        <div className={styles.content}>
          <UserFields />
        </div>
      ) : specify === 'edit' ?(
        <div className={styles.content}>
          <EditUserPage />
        </div>
      ) : specify === 'approvers' ?(
        <div className={styles.content}>
          <Approvers />
        </div>
      ) : (
            <div className={styles.content}>
              <EditUserPage />
            </div>
          )}
    </div>
  );
}
