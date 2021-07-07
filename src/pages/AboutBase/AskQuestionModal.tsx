import React from 'react';
import { Modal,Drawer } from 'antd';
import FormAddDecision from './FormAskQuestion';
import { Decision } from '../../api/decisionsApi';
import FormAskQuestion from './FormAskQuestion';

interface Props {
  visibleModal: boolean;
  setVisibleModal: (visibleModal: boolean) => void;
}

const AskQuestionModal = ({ visibleModal, setVisibleModal}: Props) => {
 
  const handleCancel = () => setVisibleModal(false);

  return (
    <Drawer
      width="auto"
      title="Задати запитання"
      visible={visibleModal}
      onClose={handleCancel}
      footer={null}
    >
      <FormAskQuestion  
        setVisibleModal = {setVisibleModal}
         />
    </Drawer>
  );
};

export default AskQuestionModal;