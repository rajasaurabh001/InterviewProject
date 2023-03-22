import * as React from 'react';
import styles from './CiNewRequest.module.scss';
import { ICiNewRequestProps } from './ICiNewRequestProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, SearchQuery, SearchResults, ItemAddResult } from "sp-pnp-js";
import * as $ from 'jquery'; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal, values } from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
export interface ICiNewRequestState {
  Interviewerrows: any;
  RequestID:number;
  CandidateFirstName :string;
  CandidateLastName:string;
  CandidateEmail:string;
  AdditionalDetails:string;
  JobTitle:string;
  IshiringManagerInterviewer: boolean;
  HiringManagerJobtitle:string;
  HiringManagerEmail:string;
  HiringManagerName:string;
  HiringManager:any;
  NewHiringManager:string;
  NewHiringManagerID:string;
  managerdropdown:any;
  addmanager:Boolean;
  Recruiter:number;
  DefaultHiringManager:any;
  RequisitionID:string;
  Status:string;
  dropdownoptions:any;
  Notes:string;
  CVURL:string;
  isModalOpen:boolean;
  // validationobject:any;
  isSubmmited:boolean;
  // isValidated:boolean;
  modalmessage:String;
  Draftmessage:String;
  Submittedmessage:String;
  siteabsoluteurl:Web;
  isCandidateFirstName :boolean;
  isCandidateLastName :boolean;
  isCandidateEmail:boolean;
  isAdditionalDetails: boolean;
  isJobTitle: boolean;
  isRequisitionID: boolean;
  isHiringManager:boolean;
  isHiringManagerJobtitle : boolean;
  isHiringManageEmail : boolean;
  //hiring manager Interviewer yes no
  
}

export default class CiNewRequest extends React.Component<ICiNewRequestProps, ICiNewRequestState> {

  constructor(props:ICiNewRequestProps,state:ICiNewRequestState ){
    super(props);
    this.state ={
      Interviewerrows:[],
      RequestID:null,
      CandidateFirstName  : "",
      CandidateLastName  : "",
      CandidateEmail:"",
      AdditionalDetails:"",
      JobTitle:"",
      RequisitionID:"",
      HiringManagerName:"",
      HiringManagerJobtitle:"",
      HiringManagerEmail:"",
      HiringManager:[],
      NewHiringManager:"",
      NewHiringManagerID:"",
      addmanager:false,
      managerdropdown:[],
      Recruiter:null,
      DefaultHiringManager:[],
      IshiringManagerInterviewer:false,
      Status:"",
      dropdownoptions:[],
      Notes:"",
      CVURL:"",
      isModalOpen:false,
      isSubmmited:false,
      isCandidateFirstName :true,
      isCandidateLastName :true,
      isCandidateEmail:true,
      isAdditionalDetails: true,
      isJobTitle: true,
      isRequisitionID: true,
      isHiringManager:true,
      isHiringManagerJobtitle : true,
      isHiringManageEmail : true,
      siteabsoluteurl:new Web(this.props.siteUrl),
      
      modalmessage:"",
      Draftmessage:"This candidate has been added as draft.",
      Submittedmessage:"This request has been submitted to the team."

    };
    
  }
  public async componentDidMount(){
    let web = new Web(this.props.siteUrl);
    web.currentUser.get().then(async result => {
      this.setState({
        Recruiter:result.Id
      });
    });
  
    this.getRequestDetail();
    this.getInterviewDetail();
    this.GetHiringManager();
    $("[class*='ms-OverflowSet ms-CommandBar-primaryCommand primarySet']").first().css( "display", "none" );
    $("[data-automation-id=pageHeader]").hide();
    $('#CommentsWrapper').hide();
    $('.CanvasZone div').eq(0).removeAttr('class');

  }
  public informationmessge={
    Interviewname:"hello Interviewname",
    InterviewEmail:"hello Interview Email",
    InterviewerJobTitle:"Interviewer job title",
    InterviewStartDate:"Interveiw Start date",
    InterviewEndDate:"Interveiw End Date",
    Timezone:"Time of interviewer",
    CandidateConfirmation:"Candidate Confirmation of Interviewer",
    CandidateAvailable:" Candidate available or not",
    submittimeslot:"Time slot to submit",

  };
  private _getPeoplePickerItems = (items: any[]) =>{
    console.log('Items:', items);
    let tempuser :any[]=[];
    items.map((item) =>{
    tempuser.push({ManagerID:item.id,
    ManagerName:item.text});
  // console.log(item.id)
});
this.setState({
  HiringManager : tempuser ,
  isHiringManager:(items.length > 0) ?true:false
  
});

console.log(this.state);
}
public handleHiringManagerChange = () => async(event) => {
  const { name, value } = event.target;
  if(name == "IshiringManagerInterviewer"){
    this.setState({
      IshiringManagerInterviewer: event.target.checked,
    });
  }
  else{
  let HiringManagerName = event.target.options[event.target.selectedIndex].text;
  this.setState({
    NewHiringManager:HiringManagerName,
    NewHiringManagerID: value,
    //HiringManagerName:HiringManagerName,
  });
}
  //const rowInfo = rows[idx];
  //rowInfo[name] = value;

}
  public handleAddRow = () => {
    const item = {
      InterviewerName: "",
      Designation: "",
      InterviewerEmail:"",
      interviewerValidation:{
        isInterviewerName:true,
        isInterviewerEmail:true,   
        isDesignation:true,  
      }
    };
    this.setState({
      Interviewerrows: [...this.state.Interviewerrows, item]
    });
  }

  private async GetTimeZone() {
    let timezones = await this.state.siteabsoluteurl.lists
      .getByTitle("TimeZone MasterList")
      .items
      .get();
      console.log(timezones);
      let dropdownoptions=[];
      timezones.forEach(key => {
        dropdownoptions.push(key.Title);
       });
    
      this.setState({
        dropdownoptions 
      });
   
  }

  public handleRemoveSpecificRow = (idx) => () => {
    
    const Interviewerrows = [...this.state.Interviewerrows];
    
    if(Interviewerrows[idx].ID != undefined){
      this.DeleterowData(Interviewerrows[idx].ID);
    }
    Interviewerrows.splice(idx, 1);
    this.setState({ Interviewerrows });
  }

   //Delete row from list
   public  DeleterowData = async (ID) => {
    let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("InterviewerDetails").items.getById(ID).delete()
  .then(i => {
    console.log("Deleted Successfully");
  });
}

public getInterviewDetail = async () =>{
  console.log("this is in addInterViewDetails");
  let queryParams = new URLSearchParams(window.location.search);
  let ID = parseInt(queryParams.get("Req")); 
  
    //console.log(el)
    // let web = new Web(this.props.siteUrl);
    let libDetails = await this.state.siteabsoluteurl.lists
    .getByTitle("InterviewerDetails")
    .items.select("*","RequestID/ID").expand("RequestID/Title").filter("RequestID eq '" + ID + "'").get().then((results) =>{
      console.log(results);
      results.forEach(element => {
        console.log(element);  
        this.bindDataRow(element);
      });
    });
}
public bindDataRow = (element) => {
  const item = {
    InterviewerName: element.Title,
    Designation: element.InterViewerDesignation,
    InterviewerEmail:element.InterviewerEmail,
    ID:element.ID,
    interviewerValidation:{
      isInterviewerName:(element.Title !="" && element.Title !=null)?true:false, 
      isInterviewerEmail:(element.InterviewerEmail !="" && element.InterviewerEmail !=null)?true:false,     
      isDesignation:(element.InterViewerDesignation != "" && element.InterViewerDesignation !=null)?true:false,  
    }
     
  };
  this.setState({
    Interviewerrows: [...this.state.Interviewerrows, item]
  });
  
}


   public getRequestDetail=async () =>{ 
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
 
    console.log(this.state);
   // let web = new Web(this.props.siteUrl);
   let libDetails = await this.state.siteabsoluteurl.lists
    .getByTitle("Candidate Interview Info")
    .items.getById(ID).select("*").get().then((response) => {
      console.log(response);
      this.setState({
        RequestID: response.ID,
        CandidateFirstName : response.CandidateFirstName ,
        CandidateLastName : response.CandidateLastName, 
        CandidateEmail: response.CandidateEmail,
        AdditionalDetails: response.AdditionalDetails,
        JobTitle: response.JobTitle,
       // HiringManager:response.HiringManagerId != null?[...this.state.HiringManager,response.HiringManagerId]:[],
       // DefaultHiringManager: response.HiringManagerId != null?[...this.state.DefaultHiringManager,response.HiringManager.EMail]:[],
        RequisitionID: response.RequisitionID,
        IshiringManagerInterviewer:response.IshiringManagerInterviewer,
        NewHiringManager:response.HiringManager,
        NewHiringManagerID:response.HiringManagerID,
        HiringManagerJobtitle:response.HiringManagerJobtitle,
        HiringManagerEmail:response.HiringManagerEmail,
        Notes:response.Notes,
        CVURL:response.CVURL,
        Status: response.Status
       });
    });
  }

  private async updateRequisitionID(itemID){
    let updatedid=itemID;
    let web = new Web(this.props.siteUrl);
    let updatelibdetail =  web.lists
    .getByTitle("Candidate Interview Info")
    .items.getById(updatedid).update({
      InterviewID: "IV_"+updatedid,
    }).then((response: ItemAddResult) => {
      let message = (this.state.isSubmmited)?this.state.Submittedmessage:this.state.Draftmessage;
      this.isModalOpen(message);
    });
  }
  private   formValidation = () => {
    let isValidated = true;
    if(this.state.CandidateFirstName == ""){
      isValidated =false;
      this.setState({isCandidateFirstName:false});
    }
    if(this.state.CandidateLastName == ""){
      isValidated =false;
      this.setState({isCandidateLastName:false});
    }
    if(this.state.CandidateEmail == ""){
      isValidated =false;
      this.setState({isCandidateEmail:false});
    }
    if(this.state.AdditionalDetails == ""){
      isValidated =false;
      this.setState({isAdditionalDetails:false});
    }
    if(this.state.JobTitle == ""){
      isValidated =false;
      this.setState({isJobTitle:false});
    }
    if(this.state.RequisitionID == ""){
      isValidated =false;
      this.setState({isRequisitionID:false});
    }
    if(this.state.HiringManager.length <= 0){
      isValidated =false;
      this.setState({isHiringManager :false});
    }
    return isValidated;
  } 
  //Add new request to the List
  private async addNewRequest(){
    let isValidated = true;
    //isValidated = this.formValidation();
    this.setState({
      isSubmmited : true,
    });
  if(isValidated){
    let queryParams = new URLSearchParams(window.location.search);
    const ID = parseInt(queryParams.get("Req")); 
    let SubmittedDatetime  =new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    if(this.state.addmanager){
      await this.addHiringMananageToMasterList();
     }
    let libDetails = this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info").items;
    if(Number.isNaN(ID)){
        libDetails.add({
          CandidateFirstName:this.state.CandidateFirstName ,
          CandidateLastName:this.state.CandidateLastName ,
          Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          RequisitionID: this.state.RequisitionID,
          IshiringManagerInterviewer:this.state.IshiringManagerInterviewer,
          HiringManagerJobtitle:this.state.HiringManagerJobtitle,
          HiringManagerEmail:this.state.HiringManagerEmail,
          HiringManagerID:this.state.NewHiringManagerID,
          HiringManager: this.state.NewHiringManager,
          RecruiterId:this.state.Recruiter,
          Notes:this.state.Notes,
          CVURL:this.state.CVURL,
          RunProcess:true,
          Comment:"Waiting for timeslot entry",
          Status:"Submitted",
          Submitted:SubmittedDatetime
      }).then(async (response: ItemAddResult) => {
        this.setState({
          RequestID: response.data.ID
         });
        
        await this.addInterviewDetail(this.state.RequestID);
        await this.updateRequisitionID(response.data.ID);
      }); 
    }else{
      libDetails.getById(ID).update({
          CandidateFirstName:this.state.CandidateFirstName ,
          CandidateLastName:this.state.CandidateLastName,
          Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          RequisitionID: this.state.RequisitionID,
          IshiringManagerInterviewer:this.state.IshiringManagerInterviewer,
          HiringManagerJobtitle:this.state.HiringManagerJobtitle,
          HiringManagerEmail:this.state.HiringManagerEmail,
          HiringManagerID:this.state.NewHiringManagerID,
          HiringManager: this.state.NewHiringManager,
          RecruiterId:this.state.Recruiter,
          Notes:this.state.Notes,
          CVURL:this.state.CVURL,
          RunProcess:true,
          Comment: "Waiting for timeslot entry",
          Status:"Submitted",
          Submitted:SubmittedDatetime
      }).then(async (response: ItemAddResult) => {
        // if(this.state.addmanager){
        //   this.addHiringMananageToMasterList();
        // }  
        await this.addInterviewDetail(ID); 
       
    }); 
    await this.isModalOpen(this.state.Submittedmessage);   
    }
  }
  }

  private async addDraftRequest(){
    
    let queryParams = new URLSearchParams(window.location.search);
    const ID = parseInt(queryParams.get("Req")); 
    if(this.state.addmanager){
      await this.addHiringMananageToMasterList();
    }  
    let libDetails = this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info").items;
    
    if(Number.isNaN(ID)){
        libDetails.add({
          CandidateFirstName:this.state.CandidateFirstName ,
          CandidateLastName:this.state.CandidateLastName,
          Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          RequisitionID: this.state.RequisitionID,
          IshiringManagerInterviewer:this.state.IshiringManagerInterviewer,
          HiringManagerJobtitle:this.state.HiringManagerJobtitle,
          HiringManagerEmail:this.state.HiringManagerEmail,
          HiringManagerID:this.state.NewHiringManagerID,
          HiringManager: this.state.NewHiringManager,
          RecruiterId:this.state.Recruiter,
          Notes:this.state.Notes,
          CVURL:this.state.CVURL,
          Comment:"Request has been created by " + this.props.userDisplayName,
          Status:"Draft",
      }).then(async (response: ItemAddResult) => {
        this.setState({
          RequestID: response.data.ID
         });
        await this.addInterviewDetail(this.state.RequestID);
        await this.updateRequisitionID(response.data.ID);
      }); 
    }else{
      libDetails.getById(ID).update({
          CandidateFirstName:this.state.CandidateFirstName ,
          CandidateLastName:this.state.CandidateLastName ,
          Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          RequisitionID: this.state.RequisitionID,
          IshiringManagerInterviewer:this.state.IshiringManagerInterviewer,
          HiringManagerJobtitle:this.state.HiringManagerJobtitle,
          HiringManagerEmail:this.state.HiringManagerEmail,
          HiringManagerID:this.state.NewHiringManagerID,
          HiringManager: this.state.NewHiringManager,
          RecruiterId:this.state.Recruiter,
          Notes:this.state.Notes,
          CVURL:this.state.CVURL,
      })
      // if(this.state.addmanager){
      //   this.addHiringMananageToMasterList();
      // }  
      await this.addInterviewDetail(ID);   
      await this.isModalOpen(this.state.Draftmessage);   
    }
  }

  private addHiringMananageToMasterList = async () =>{
    console.log("this is in addInterViewDetails");
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists.getByTitle("HiringManagerMasterList").
        items.add({					 
          HiringManagers:this.state.NewHiringManager
        })
        console.log("managerlist addition");
        // console.log(libDetails);
        
          this.setState({
            NewHiringManagerID:(libDetails.data.ID).toString(),
          })

      //}
      }

      public addInterviewDetail=async (RequestID) =>{
        console.log("this is in addInterViewDetails");
        let queryParams = new URLSearchParams(window.location.search);
        const ID = parseInt(queryParams.get("Req")); 
        if(Number.isNaN(ID)){
        if(this.state.IshiringManagerInterviewer) {
        const item = {
            InterviewerName: this.state.NewHiringManager,
            Designation: this.state.HiringManagerJobtitle,
            InterviewerEmail:this.state.HiringManagerEmail,
            interviewerValidation:{
              isInterviewerName:true,
              isInterviewerEmail:true,   
              isDesignation:true,  
            }
          };
          this.setState({
            Interviewerrows: [...this.state.Interviewerrows, item],
          });
        }
        }
        let interviewers=this.state.Interviewerrows;
        interviewers.forEach(async (el)=>{
          console.log(el);
          let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("InterviewerDetails");
          if(el.ID == undefined){
            libDetails.items.add({
              Title: el.InterviewerName,
              InterViewerDesignation: el.Designation,
              InterviewerEmail:el.InterviewerEmail,
              RequestIDId:RequestID
            }).then(async () => {
              console.log("added interviewer");
            });
          }
          else{
            libDetails.items.getById(el.ID).update({
              Title: el.InterviewerName,
              InterViewerDesignation: el.Designation,
              InterviewerEmail:el.InterviewerEmail,
            });
          }
        });    
      }

  public handleRowChange = (idx) => async (event) => {
    const Interviewerrows = [...this.state.Interviewerrows];
    const { name, value } = event.target;
    const rowInfo = Interviewerrows[idx];
    rowInfo[name] = value;
    //rowInfo["interviewerValidation"]["is"+name] =(event.target.value != "") ? true:false
    this.setState({
      Interviewerrows
    });
  }
  public isModalOpen = async(message:any) => {
    this.setState({
      isModalOpen:true,
      modalmessage:message,
    });
  }
  public reload =() =>{
    const myTimeout = setTimeout(window.location.href=this.props.siteUrl+"/SitePages/Dashboard.aspx", 2000);
  }
  private async GetHiringManager() {
    let web = new Web(this.props.siteUrl);
    let HiringManagers = await web.lists
      .getByTitle("HiringManagerMasterList").items.select("*")
      .get();
      let managerdropdown=[];
      HiringManagers.forEach(key => {
        managerdropdown.push({ID:key.ID,
        Title:key.HiringManagers});
       });
    
      this.setState({
        managerdropdown 
      });
   
  }
  public render(): React.ReactElement<ICiNewRequestProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (      
        <div className={styles.maincontainer}>
          <div className={styles['grid-container-element']}>
            <div className={styles['grid-child-element']}>
              <h2 className={styles.header}>Create New Interview Request</h2>
            </div>
            <div className={styles['grid-child-element']}> <img src={require('../assets/homeicon.png')} className={styles.homeIcon}  onClick={this.reload}/></div>
          </div>
          
          <Modal isOpen={this.state.isModalOpen} isBlocking={false} className={styles.custommodalpopup} >
            <div className='modal-dialog modal-help' style={{width: '500px', height: '170px',}}>
              <div className='modal-content'>
                <div className={styles['modal-body']}><span ><h2 className='modalmessage'>{this.state.modalmessage}</h2></span>
                <div><img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/></div></div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{this.reload();}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
                </div>
              </div>
            </div>          
          </Modal>

          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span><b>Candidate Details</b></span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>First Name</span>               
            </div>
            <div className={styles.columnright}>
            <input type="text" 
              className={styles.inputtext}   
              required={true}
              onChange={(e)=>{
                this.setState({
                  CandidateFirstName  : e.target.value,
                  // validationobject: {
                    isCandidateFirstName:(e.target.value) != "" ?true:false
                  // }
                });
              }} 
             value={this.state.CandidateFirstName }/> 
            {(!this.state.isCandidateFirstName)?<div className={styles.row}><span className={styles.requiredfield}  >Field can not be blank!</span></div>:null}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Last Name</span>               
            </div>
            <div className={styles.columnright}>
            <input type="text" 
              className={styles.inputtext}   
              required={true}
              onChange={(e)=>{
                this.setState({
                  CandidateLastName  : e.target.value,
                  // validationobject: {
                    isCandidateLastName:(e.target.value) != "" ?true:false
                  // } 
                });
              }} 
              // id="val_CandidateLastName"
             value={this.state.CandidateLastName }/>  
              {(!this.state.isCandidateLastName)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Email</span>                
            </div>
            <div className={styles.columnright}>   
            <input type="email" 
              required={true}
              className={styles.inputtext}  
              onChange={(e)=>{
                this.setState({
                  CandidateEmail : e.target.value,
                  // validationobject: {
                    isCandidateEmail:(e.target.value) != "" ?true:false
                  // }
                });
              }}   
              value={this.state.CandidateEmail}/>  
              {/* <div className={styles.row}><span className={styles.requiredfield} id="val_CandidateEmail">Field can not be blank!</span></div>        */}
              {(!this.state.isCandidateEmail)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Candidate ID</span>                
            </div>
            <div className={styles.columnright}>      
            <input type="text" 
              required={true}
              className={styles.inputtext} 
               onChange={(e)=>{
                this.setState({
                  AdditionalDetails : e.target.value,
                  // validationobject: {
                    isAdditionalDetails:(e.target.value) != "" ?true:false
                  // }
                });
              }}   
              value={this.state.AdditionalDetails}/>   
            {/* <div className={styles.row}><span className={styles.requiredfield} id="val_AdditionalDetails">Field can not be blank!</span></div> */}
            {(!this.state.isAdditionalDetails)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span><b>Position Details</b></span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Hiring Manager</span>                
            </div>
            <div className={styles.columnright}>  
              <select  
                name="selectHiringManager" 
                className={styles.selecttext} 
                // disabled={true}
                value={this.state.NewHiringManagerID}
                onChange={this.handleHiringManagerChange()}
                // className={styles.disabledSelectbox}
                >
                <option value="">Select Hiring Manager.If not on list press +</option>
                {this.state.managerdropdown.map((newitem) => (<option value={newitem.ID}>{newitem.Title}</option>))}
                </select>
                <img src={this.state.addmanager?require('../assets/cross.png'):require('../assets/plus.png')} className={styles.imgTableIcon} onClick={() => this.setState({addmanager:(this.state.addmanager)?false:true})} />
              {this.state.addmanager?
              <div>
                 <input type="text" 
                required={true}
                name="NewHiringManager" 
                className={styles.newmanagertextbox} 
                onChange={(e)=>{
                  this.setState({
                    NewHiringManager : e.target.value ,
                   // isHiringManager:(e.target.value.length > 0) ?true:false
                    
                  });
                }}   
              value={this.state.NewHiringManager}/>  
               </div>
              :null}
            {/* <div className={styles.row}><span className={styles.requiredfield} id="val_HiringManager">Field can not be blank!</span></div> */}
            {(!this.state.isHiringManager)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null} 
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              {/* changed job Title label to Requisition Title */}
              <span><span className={styles.requiredfield}>* </span>Requisition Title</span>                
            </div>
            <div className={styles.columnright}>  
            <input type="text" 
              required={true}
              className={styles.inputtext}  
              onChange={(e)=>{
                this.setState({
                  JobTitle : e.target.value,
                  // validationobject: {
                    isJobTitle:(e.target.value) != "" ?true:false
                  // }
                });
              }}  
              value={this.state.JobTitle}/>  
              {/* <div className={styles.row}><span className={styles.requiredfield} id="val_JobTitle">Field can not be blank!</span></div> */}
              {(!this.state.isJobTitle)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div>
         
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Requisition ID</span>                
            </div>
            <div className={styles.columnright}>    
            <input 
              type="text" 
                required={true}
                name="RequisitionID" 
                className={styles.inputtext} 
                onChange={(e)=>{
                  this.setState({
                    RequisitionID : e.target.value,
                    // validationobject: {
                      isRequisitionID:(e.target.value) != "" ?true:false
                    // }
                  });
                }}   
              value={this.state.RequisitionID}/>  
             {/* <div className={styles.row}><span className={styles.requiredfield} id="val_RequisitionID">Field can not be blank!</span></div> */}
             {(!this.state.isRequisitionID)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div>
          
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span><b>Interviewer Details</b></span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}> * </span>Is Interviewer Hiring Manager?</span>                
            </div>
            <div className={styles.columnright}>  
            <input
              // disabled={this.state.candiConfChecked}
              type="checkbox"
              name="IshiringManagerInterviewer"
              checked={this.state.IshiringManagerInterviewer}
              onChange={this.handleHiringManagerChange()}
              className="form-control"
              />
            {/* <select  
                // defaultValue={"No"}
                name="IshiringManagerInterviewer" 
                className={styles.inputtext}
                // disabled={true}
                value={this.state.IshiringManagerInterviewer}
                onChange={this.handleHiringManagerChange()}
                // className={styles.disabledSelectbox}
                >
                <option value="">Is Interviewer Hiring Manager?</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
                </select>   */}
            </div>
          </div>
          {this.state.IshiringManagerInterviewer?<div><div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Hiring Manager Job Title</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" 
                required={true}
                name="HiringManagerJobTitle" 
                className={styles.inputtext} 
                onChange={(e)=>{
                  this.setState({
                    HiringManagerJobtitle: e.target.value,
                    // validationobject: {
                      isHiringManagerJobtitle:(e.target.value) != "" ?true:false
                    // }
                  });
                }}   
              value={this.state.HiringManagerJobtitle}/>  
           
             {(!this.state.isHiringManagerJobtitle)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
            
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Hiring Manager Email Address</span>                
            </div>
            <div className={styles.columnright}>    
              <input type="text" 
                required={true}
                name="HiringManagerEmail" 
                className={styles.inputtext} 
                onChange={(e)=>{
                  this.setState({
                    HiringManagerEmail: e.target.value,
                    // validationobject: {
                      isHiringManageEmail:(e.target.value) != "" ?true:false
                    // }
                  });
                }}   
              value={this.state.HiringManagerEmail}/>  
             {(!this.state.isHiringManageEmail)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div></div>:null}
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span><b>Optional</b></span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Link to open resume</span>               
            </div>
            <div className={styles.columnright}>
            <input type="text" 
              className={styles.inputtext}   
              required={true}
              onChange={(e)=>{
                this.setState({
                  CVURL  : e.target.value,
                  // validationobject: {
                  //  isCandidateFirstName:(e.target.value) != "" ?true:false
                  // }
                });
              }} 
             value={this.state.CVURL }/> 
             {this.state.CVURL != ""?<img src={require('../assets/externalLink.png')} className={styles.imgTableIcon} onClick={() =>window.open(this.state.CVURL, '_blank')} />:null} 
             
             {/* id="val_CandidateFirstName"  */}
            {/* {(!this.state.isCandidateFirstName)?<div className={styles.row}><span className={styles.requiredfield}  >Field can not be blank!</span></div>:null} */}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Notes</span>               
            </div>
            <div className={styles.columnright}>
              <textarea 
              cols={30}
              rows={10}
              className={styles.notetextarea} 
              name="Notes" 
              value={this.state.Notes }
              onChange={(e)=>{
                this.setState({
                  Notes  : e.target.value,
                  // validationobject: {
                   // isCandidateLastName:(e.target.value) != "" ?true:false
                  // } 
                });
                }} />
            </div>
          </div>
          
          
           <div className={styles.row}>
            <div className={styles.columnfull}>
              <span><b>List of Interviewers</b></span>                
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
          <table className={styles.interviewers} >        
                  <tr>
                    <th className="text-center"> Interviewer Name 
                      <div title={this.informationmessge.Interviewname} className={styles.theadicon}>
                          <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                        </div>
                    </th>
                    <th className="text-center"> Interviewer email address
                      <div title={this.informationmessge.InterviewEmail} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
                    <th className="text-center"> Interviewer Job Title
                      <div title={this.informationmessge.InterviewerJobTitle} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
                    <th className="text-center">
                      <img src={require('../assets/plus.png')} className={styles.imgTableIcon}  onClick={this.handleAddRow}/>
                    </th>	
                  </tr>
                  {this.state.Interviewerrows.map((item, idx) => (
                    <tr id="addr0" key={idx}>
                      <td>
                        <input
                          required={true}
                          type="text"
                          name="InterviewerName"
                          value={this.state.Interviewerrows[idx].InterviewerName }
                           onChange={this.handleRowChange(idx)}
                          className="form-control"
                        />
                         {(!this.state.Interviewerrows[idx].interviewerValidation.isInterviewerName)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                      <td>
                        <input
                          required={true}
                          type="text"
                          name="InterviewerEmail"
                          value={this.state.Interviewerrows[idx].InterviewerEmail }
                          onChange={this.handleRowChange(idx)}
                          className="form-control"
                        />
                        {(!this.state.Interviewerrows[idx].interviewerValidation.isInterviewerEmail)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                      
                      <td>
                        <input
                          type="text"
                          name="Designation"
                          value={this.state.Interviewerrows[idx].Designation}
                          onChange={this.handleRowChange(idx)}
                          className="form-control"
                        />
                        {(!this.state.Interviewerrows[idx].interviewerValidation.isDesignation)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                     
                      
                      <td><img src={require('../assets/cross.png')} className={styles.imgTableIcon}  onClick={this.handleRemoveSpecificRow(idx)}/></td>
                      
                    </tr>
                    ))}
                  </table>

              
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>

          {(this.state.Status == "Draft" || this.state.Status == "")?
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>   
            <button type="button" className={styles.submitButton} onClick = {() =>this.addDraftRequest()}>Draft</button>  
            <button type="submit" className={styles.submitButton} onClick ={() =>this.addNewRequest()}>Submit</button>  
            <button className={styles.submitButton} name="Cancel" onClick={() => this.reload()}>Cancel</button>         
            </div>
          </div>
           :null}
           
        </div> 
      
    );
  }
}
