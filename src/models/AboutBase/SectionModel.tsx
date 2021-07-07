import SubSectionModal from './SubsectionModel';
export default class Section{
    id: number;
    title: string;
    subsection:SubSectionModal;
    constructor(){
        this.id = 0;
        this.title = "";
        this.subsection = new SubSectionModal; 
    }
}