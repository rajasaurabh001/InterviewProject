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
  CandidateTimezone:string;
  JobTitle:string;
  IshiringManagerInterviewer: boolean;
  HiringManagerJobtitle:string;
  HiringManagerEmail:string;
  HiringManagerName:string;
  HiringManager:any;
  NewHiringManager:string;
  NewHiringManagerID:string;
  ExistingHiringManager:any;
  isExistedEmailId:Boolean;
  managerdropdown:any;
  addmanager:Boolean;
  Recruiter:number;
  DefaultHiringManager:any;
  RequisitionID:string;
  Status:string;
  dropdownoptions:any;
  Notes:string;
  CVURL:string;
  AllHiringManager:any;
  isModalOpen:boolean;
  // validationobject:any;
  isSubmmited:boolean;
  /// isValidated:boolean;
  modalmessage:String;
  Draftmessage:String;
  Submittedmessage:String;
  siteabsoluteurl:Web;
  //-------------Validation Variable--------------//
  isCandidateFirstName:boolean;
  isCandidateLastName:boolean;
  isCandidateEmail:boolean;
  isAdditionalDetails:boolean;
  isCandidateTimezone:boolean;
  isJobTitle:boolean;
  isRequisitionID:boolean;
  isNewHiringManager:boolean;
  isNewHiringManagerID:boolean;
  isHiringManager:boolean;
  isHiringManagerJobtitle : boolean;
  isHiringManagerEmail : boolean;
  //-------------Validation Variable--------------//
  
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
      CandidateTimezone:"",
      JobTitle:"",
      RequisitionID:"",
      HiringManagerName:"",
      HiringManagerJobtitle:"",
      HiringManagerEmail:"",
      HiringManager:[],
      NewHiringManager:"",
      NewHiringManagerID:"",
      ExistingHiringManager:[],
      isExistedEmailId:false,
      addmanager:false,
      managerdropdown:[],
      Recruiter:null,
      DefaultHiringManager:[],
      IshiringManagerInterviewer:false,
      Status:"",
      dropdownoptions:[],
      Notes:"",
      CVURL:"",
      AllHiringManager:[],
      isModalOpen:false,
      isSubmmited:false,
      //-------------- Validation Variables ----------------------//
      isCandidateFirstName :true,
      isCandidateLastName :true,
      isCandidateEmail:true,
      isAdditionalDetails: true,
      isCandidateTimezone:true,
      isJobTitle: true,
      isRequisitionID: true,
      isNewHiringManager:true,
      isNewHiringManagerID:true,
      isHiringManager:true,
      isHiringManagerJobtitle : true,
      isHiringManagerEmail: true,
//-------------- Validation Variables ----------------------//
      siteabsoluteurl:new Web(this.props.siteUrl),
      
      modalmessage:"",
      Draftmessage:"This candidate has been added as draft.",
      Submittedmessage:"This request has been submitted to the team."

    };
    
  }
// --------------------Component did mount function--------------------------//4

  public async componentDidMount(){
    let web = new Web(this.props.siteUrl);
    web.currentUser.get().then(async result => {
      this.setState({
        Recruiter:result.Id
      });
    });
    this.getRequestDetail();
    this.getInterviewDetail();
    this.GetTimeZone();
    this.GetHiringManager();
    $("[class*='ms-OverflowSet ms-CommandBar-primaryCommand primarySet']").first().css( "display", "none" );
    $("[data-automation-id=pageHeader]").hide();
    $('#CommentsWrapper').hide();
    $('.CanvasZone div').eq(0).removeAttr('class');

  }

 //--------------showing message on i icon ---------------------------------//

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

//------------- Manage people picker ------------------//

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

// ----------------------- Select hiring Manager -------------------//

public handleHiringManagerChange = () => async(event) => {
  const { name, value } = event.target;
  if(name == "IshiringManagerInterviewer"){
    this.setState({
      IshiringManagerInterviewer: event.target.checked,
    });
  }
  else{
  let HiringManagerName = event.target.options[event.target.selectedIndex].text;
  const filteredPeople = this.state.AllHiringManager.filter((person) => {
    return person.ID == value;
  });
  this.setState({
    NewHiringManager:filteredPeople.length > 0?HiringManagerName:"",
    NewHiringManagerID: value,
    HiringManagerJobtitle:filteredPeople.length > 0?filteredPeople[0].HRDesignation:"",
    HiringManagerEmail:filteredPeople.length >0?filteredPeople[0].Email:"",
  });
}
}

// -------------------------------- Add Rows to the Grid ----------------------------------//

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

// -------------------------      Get Time Zones     -------------------------//

  private async GetTimeZone() {
    let timezones = await this.state.siteabsoluteurl.lists
      .getByTitle("TimeZone MasterList")
      .items
      .get();
      console.log(timezones);
      let dropdownoptions=[];
      timezones.forEach(key => {
        dropdownoptions.push({Title:key.Title,
        //  TimezoneValue:key.TimezoneValue,
          Location:key.Location
        });
      });
    
      this.setState({
        dropdownoptions 
      });
   
  }

//---------------------Remove Rows from the Grid on cross button click----------------------//
  public handleRemoveSpecificRow = (idx) => () => {
    
    const Interviewerrows = [...this.state.Interviewerrows];
    
    if(Interviewerrows[idx].ID != undefined){
      this.DeleterowData(Interviewerrows[idx].ID);
    }
    Interviewerrows.splice(idx, 1);
    this.setState({ Interviewerrows });
  }


//--------------------- Delete row from list-------------------------------------------------//

public  DeleterowData = async (ID) => {
  let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("InterviewerDetails").items.getById(ID).delete()
}

// -------------------- Get All interviewers Details ---------------------------------------//

public getInterviewDetail = async () =>{
  console.log("this is in addInterViewDetails");
  let queryParams = new URLSearchParams(window.location.search);
  let ID = parseInt(queryParams.get("Req")); 
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

// -------------------------- Bind All interviewer Details to The table Grid ----------------//

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
 //--------------------Get all Details of saved Request --------------------//

   public getRequestDetail=async () =>{ 
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    console.log(this.state);
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
        CandidateTimezone:response.CandidateTimezone,
        JobTitle: response.JobTitle,
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
// ------------------- update Interview Id on List --------------//
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

  //----------------------------form validation function---------------------//

  private   formValidation = () => {
    let isValidated = true;
    const Interviewerrows = [...this.state.Interviewerrows];
    if(this.state.CandidateFirstName == "" || this.state.CandidateFirstName == null || this.state.CandidateFirstName == undefined){
      isValidated =false;
      this.setState({isCandidateFirstName:false});
    }
    if(this.state.CandidateLastName == "" || this.state.CandidateLastName == null || this.state.CandidateLastName == undefined){
      isValidated =false;
      this.setState({isCandidateLastName:false});
    }
    if(this.state.CandidateEmail == "" || this.state.CandidateEmail == null || this.state.CandidateEmail == undefined){
      isValidated =false;
      this.setState({isCandidateEmail:false});
    }
    if(this.state.AdditionalDetails == ""  || this.state.AdditionalDetails == null || this.state.AdditionalDetails == undefined){
      isValidated =false;
      this.setState({isAdditionalDetails:false});
    }
    if(this.state.CandidateTimezone == "" || this.state.CandidateTimezone == null || this.state.CandidateTimezone == undefined){
      isValidated =false;
      this.setState({isCandidateTimezone:false});
    }

    if(this.state.JobTitle == "" || this.state.JobTitle == null || this.state.JobTitle == undefined){
      isValidated =false;
      this.setState({isJobTitle:false});
    }
    if(this.state.RequisitionID == "" || this.state.RequisitionID == null || this.state.RequisitionID == undefined){
      isValidated =false;
      this.setState({isRequisitionID:false});
    }
    // if(this.state.ExistingHiringManager.indexof(this.state.HiringManagerEmail) > -1 && this.state.addmanager == true){
    //   isValidated =false;
    //   this.setState({isHiringManager :false});
    // }
    if(this.state.HiringManagerJobtitle == "" || this.state.HiringManagerJobtitle == null || this.state.HiringManagerJobtitle == undefined){
      isValidated =false;
      this.setState({isHiringManagerJobtitle :false});
    }
    if(this.state.HiringManagerEmail == "" || this.state.HiringManagerEmail == null || this.state.HiringManagerEmail == undefined){
      isValidated =false;
      this.setState({isHiringManagerEmail :false});
    }
    if(this.state.addmanager && this.state.ExistingHiringManager.includes(this.state.HiringManagerEmail)){
      isValidated =false;
      this.setState({isExistedEmailId :true});
    }
    if((this.state.NewHiringManager == ""  || this.state.NewHiringManager == null || this.state.NewHiringManager == undefined) && this.state.addmanager){
      isValidated =false;
      this.setState({isNewHiringManager :false});
    }
    if((this.state.NewHiringManagerID == "" || this.state.NewHiringManagerID == null || this.state.NewHiringManagerID == undefined) && this.state.addmanager==false){
      isValidated =false;
      this.setState({isNewHiringManagerID :false});
    }
    Interviewerrows.forEach((element,idx) => {
      
      if(Interviewerrows[idx].InterviewerName == null || Interviewerrows[idx].InterviewerName == "" || Interviewerrows[idx].InterviewerName == undefined){
         isValidated = false;
         Interviewerrows[idx].interviewerValidation.isInterviewerName =false;
      }
      if(Interviewerrows[idx].InterviewerEmail == null || Interviewerrows[idx].InterviewerEmail == "" || Interviewerrows[idx].InterviewerEmail == undefined){
       isValidated = false;
       Interviewerrows[idx].interviewerValidation.isInterviewerEmail =false;
      }
      if(Interviewerrows[idx].Designation == null || Interviewerrows[idx].Designation == ""  || Interviewerrows[idx].Designation == undefined){
       isValidated = false;
       Interviewerrows[idx].interviewerValidation.isDesignation = false;
      }
     });
     this.setState({
       Interviewerrows
     })
    return isValidated;
  } 


  //--------------------   Add new request to the List  submitted-case  ---------------------------------//
  private async addNewRequest(){
   // let isValidated = false;
    let isValidated = this.formValidation();
    this.setState({
      isSubmmited : true,
    });
  if(this.state.addmanager && this.state.isExistedEmailId){
    this.setState({isExistedEmailId:false})
    alert("Hiring Manager Email Address aleady Exist in List")
  }
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
          CandidateTimezone: this.state.CandidateTimezone,
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
          CandidateTimezone: this.state.CandidateTimezone,
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
        await this.addInterviewDetail(ID);   
    }); 
    await this.isModalOpen(this.state.Submittedmessage);   
    }
  }
  }
  //--------------------   Add new request to the List  Draft-Case  ---------------------------------//

  private async addDraftRequest(){ 
    let isvalidated=true;
    let queryParams = new URLSearchParams(window.location.search);
    const ID = parseInt(queryParams.get("Req")); 
    if(this.state.addmanager && this.state.ExistingHiringManager.includes(this.state.HiringManagerEmail)){
      this.setState({isExistedEmailId :true});
    }
    if(this.state.addmanager && this.state.isExistedEmailId){
      this.setState({isExistedEmailId:false})
      isvalidated=false;
      alert("Hiring Manager Email Address aleady Exist in List")
    }
    if(this.state.addmanager && !this.state.isExistedEmailId ){
      await this.addHiringMananageToMasterList();
    } 
    let libDetails = this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info").items;
    if(isvalidated){
      if(Number.isNaN(ID)){
          libDetails.add({
            CandidateFirstName:this.state.CandidateFirstName ,
            CandidateLastName:this.state.CandidateLastName,
            Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
            CandidateEmail: this.state.CandidateEmail,
            AdditionalDetails: this.state.AdditionalDetails,
            CandidateTimezone: this.state.CandidateTimezone,
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
            CandidateTimezone: this.state.CandidateTimezone,
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
        });
        await this.addInterviewDetail(ID);   
        await this.isModalOpen(this.state.Draftmessage);   
      }
    }
  }

 //---------------------------- Add New Hiring Manager to HiringManagerMasterList --------------------//

  private addHiringMananageToMasterList = async () =>{
    console.log("this is in addInterViewDetails");
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists.getByTitle("HiringManagerMasterList").
        items.add({				 
          HiringManagers:this.state.NewHiringManager,
          HiringManagerDesignation:this.state.HiringManagerJobtitle,
          HiringManagersEmailId:this.state.HiringManagerEmail
        });
        console.log(libDetails +"managerlist addition");
          this.setState({
            NewHiringManagerID:(libDetails.data.ID).toString(),
          });
      }
//------------------ Add interviewer Details to list ----------------------//

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
//--------------------------------Handle changes of Interviewer section Grid---------------------//
  public handleRowChange = (idx) => async (event) => {
    const Interviewerrows = [...this.state.Interviewerrows];
    const { name, value } = event.target;
    const rowInfo = Interviewerrows[idx];
    rowInfo[name] = value;
    rowInfo["interviewerValidation"]["is"+name] =(event.target.value != "") ? true:false
    this.setState({
      Interviewerrows
    });
  }


//----------------------------Model box ---------------------------------------//
  public isModalOpen = async(message:any) => {
    this.setState({
      isModalOpen:true,
      modalmessage:message,
    });
  }

//----------------------------Model box ---------------------------------------//
  public reload =() =>{
    const myTimeout = setTimeout(window.location.href=this.props.siteUrl+"/SitePages/Dashboard.aspx", 2000);
  }

//--------------------- Get Hiring Manager from list to bind on Dropdown------//  
  private async GetHiringManager() {
    let web = new Web(this.props.siteUrl);
    let HiringManagers = await web.lists
      .getByTitle("HiringManagerMasterList").items.select("*")
      .get();
      let AllHiringManager = []  ;
      HiringManagers.forEach(element => {
        AllHiringManager.push(
        {
          ID:element.ID,
          Title:element.HiringManagers,
          Email:element.HiringManagersEmailId,
          HRDesignation:element.HiringManagerDesignation
      });
      });
     // this.state.ExistingHiringManager
      let managerdropdown=[];
      HiringManagers.forEach(key => {
        managerdropdown.push({ID:key.ID,
        Title:key.HiringManagers});
        this.state.ExistingHiringManager.push(key.HiringManagersEmailId);
       });
    
      this.setState({
        managerdropdown,
        AllHiringManager
      });
   
  }

  //-----------------Render function for all Html -------------------------------------------//

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
              <span><b>Position Details</b></span>               
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
                    isRequisitionID:(e.target.value) != "" ?true:false
                  });
                }}   
              value={this.state.RequisitionID}/>  
             {(!this.state.isRequisitionID)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
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
                  isJobTitle:(e.target.value) != "" ?true:false
                 
                });
              }}  
              value={this.state.JobTitle}/>  
              {(!this.state.isJobTitle)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
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
                value={this.state.NewHiringManagerID}
                onChange={this.handleHiringManagerChange()}
                >
                <option value="">Select Hiring Manager.If not on list press +</option>
                {this.state.managerdropdown.map((newitem) => (<option value={newitem.ID}>{newitem.Title}</option>))}
                </select>
                <img src={this.state.addmanager?require('../assets/cross.png'):require('../assets/plus.png')} className={styles.imgTableIcon} onClick={() => this.setState({
                  addmanager:(this.state.addmanager)?false:true,
                  isNewHiringManagerID:true})} />
                {/* </div> */}
                {(!this.state.isNewHiringManagerID)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
              {/* <div> */}
              {this.state.addmanager?
              <div>
                <input type="text" 
                required={true}
                name="NewHiringManager" 
                className={styles.newmanagertextbox} 
                onChange={(e)=>{
                  this.setState({
                    NewHiringManager : e.target.value ,
                    isNewHiringManager:(e.target.value.length > 0) ?true:false
                    
                  });
                }}   
                value={this.state.NewHiringManager}/>  
               {(!this.state.isNewHiringManager)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
               </div>
              :null}
            </div>
          </div>
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
                  isCandidateLastName:(e.target.value) != "" ?true:false
                });
              }} 
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
                  isCandidateEmail:(e.target.value) != "" ?true:false
                  
                });
              }}   
              value={this.state.CandidateEmail}/>  
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
                  isAdditionalDetails:(e.target.value) != "" ?true:false
                });
              }}   
              value={this.state.AdditionalDetails}/>   
            {(!this.state.isAdditionalDetails)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Candidate TimeZone</span>                
            </div>
            <div className={styles.columnright}>  
              <select  
              name="CandidateTimeZone"
              value={this.state.CandidateTimezone} 
              onChange={(e)=>{
                this.setState({
                  CandidateTimezone : e.target.value,
                  isCandidateTimezone:(e.target.value) != "" ?true:false
                });
              }}                
              className={styles.selecttext}>
              <option value="">Select Time Zone</option>
              {this.state.dropdownoptions.map((newitem) => (<option value={newitem.Title}>{newitem.Location}</option>))}
              </select>  
              {(!this.state.isCandidateTimezone)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}                        
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
              type="checkbox"
              name="IshiringManagerInterviewer"
              checked={this.state.IshiringManagerInterviewer}
              onChange={this.handleHiringManagerChange()}
              className="form-control"
              />
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
                    isHiringManagerJobtitle:(e.target.value) != "" ?true:false
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
                      isHiringManagerEmail:(e.target.value) != "" ?true:false
                  });
                }}   
              value={this.state.HiringManagerEmail}/>  
             {(!this.state.isHiringManagerEmail)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
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
                });
              }} 
             value={this.state.CVURL }/> 
             {this.state.CVURL != ""?<img src={require('../assets/externalLink.png')} className={styles.imgTableIcon} onClick={() =>window.open(this.state.CVURL, '_blank')} />:null} 
             
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
