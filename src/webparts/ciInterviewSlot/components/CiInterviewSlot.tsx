import * as React from 'react';
import styles from './CiInterviewSlot.module.scss';
import * as $ from 'jquery'; 
import { ICiInterviewSlotProps } from './ICiInterviewSlotProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ItemAddResult, Web } from 'sp-pnp-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
// import { IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';
// import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
export interface ICiInterviewSlotState {
  rows: any;
  Timezonerows: any
  newrows:any; //new interviewer
  RequestID:any;
  CandidateFirstName :string;
  CandidateLastName:string;
  CandidateName:string;
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
  JobDetails:string;
  maxsequence:any;
  checkboxvalidation:boolean;
  candiConfChecked:boolean;
  RequestStatus:string;
  dropdownoptions:any;
  Notes:string;
  CVURL:string;
  AllHiringManager:any;
  isModalOpen:boolean;
  modalmessage:string;
  accepticon:boolean;
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

export default class CiInterviewSlot extends React.Component<ICiInterviewSlotProps, ICiInterviewSlotState> {

  constructor(props:ICiInterviewSlotProps, state:ICiInterviewSlotState) {
    super(props);
    this.state ={
      rows: [],
      Timezonerows: [],
      newrows: [], //new interviewer
      RequestID:"",
      CandidateFirstName  : "",
      CandidateLastName  : "",
      CandidateName : "",
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
      JobDetails:"",
      maxsequence:1,
      checkboxvalidation:false,
      candiConfChecked:false,
      RequestStatus:"",
      dropdownoptions:[],
      Notes:"",
      CVURL:"",
      AllHiringManager:[],
      isModalOpen:false,
      modalmessage:"",
      accepticon:true,
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
    this.getInterviewTimeDetail();
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

//------------------Handle Changes for Interview Time details grid Section----------------//

  public handlenewRowChange =(idx,elementName) => async(event) => {
    let ele =elementName;
    const newrows = [...this.state.newrows];
    if(elementName=="interviewStartDate"){
      newrows[idx].interviewStartDate = event;
      newrows[idx].interviewEndDate = event;
      newrows[idx].interviewerValidation.isinterviewStartDate =(event != null)?true:false
      newrows[idx].Onlyread = false;

    }else if(elementName=="interviewEndDate"){
      newrows[idx].interviewEndDate = event;
      newrows[idx].interviewerValidation.isinterviewEndDate =(event != null)?true:false
    }else if(elementName=="CandidateConfirmation"){
      newrows[idx].CandidateConfirmation = event.target.checked;
      if(event.target.checked){
        this.setState({
          candiConfChecked:true,
        }); 
      }else{
        this.setState({
          candiConfChecked:false
        });
      }
    }
    else{
      const { name, value } = event.target;
      const rowInfo = newrows[idx];
      rowInfo[name] = value;
      rowInfo["interviewerValidation"]["is"+name] =(event.target.value != "") ? true:false
    }
    this.setState({
      newrows
    });
  }

//-------------- hadle changes of Interviewer Grid Section -----------------------------// 

  public handleChange = (idx,elementName) => async(event) => {
    let ele =elementName;
    const rows = [...this.state.rows];
      const { name, value } = event.target;
      const rowInfo = rows[idx];
      rowInfo[name] = value;
      rowInfo["interviewerValidation"]["is"+name] =(event.target.value != "") ? true:false
    this.setState({
      rows
    });
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
      rows: [...this.state.rows, item]
    });
  }
  
  public handleTimeRowChange = (idx,elementName) => async(event) => {
    let ele =elementName;
    const Timezonerows = [...this.state.Timezonerows];
    if(elementName=="interviewStartDate"){
      Timezonerows[idx].interviewStartDate = event;
      Timezonerows[idx].interviewEndDate = event;
      Timezonerows[idx].interviewerValidation.isinterviewStartDate =(event != null)?true:false

    }else if(elementName=="interviewEndDate"){
      Timezonerows[idx].interviewEndDate = event;
      Timezonerows[idx].interviewerValidation.isinterviewEndDate =(event != null)?true:false
    }else if(elementName=="InterviewerAvailability"){
      Timezonerows[idx].InterviewerAvailability = event.target.checked;
      Timezonerows[idx].interviewerValidation.isInterviewerAvailability =(event.target.checked == true)?true:false
      if(event.target.checked){
            this.setState({
              checkboxvalidation:true,
            });
          }else{
            this.setState({
              checkboxvalidation:false
            });
          }
     }
     //else if(elementName=="CandidateConfirmation"){
    //   Timezonerows[idx].CandidateConfirmation = event.target.checked;
    //   if(event.target.checked){
    //     this.setState({
    //       candiConfChecked:true,
    //     });
    //   }else{
    //     this.setState({
    //       candiConfChecked:false
    //     });
    //   }
    // }
    else{
      const { name, value } = event.target;
      const rowInfo = Timezonerows[idx];
      rowInfo["interviewerValidation"]["is"+name] =(event.target.value != "") ? true:false
      rowInfo[name] = value;
    }
    this.setState({
      Timezonerows
    });
    // if(Timezonerows[idx].CandidateConfirmation==true){
    //   await this.toggleCheckbox(false,idx);
    // }
    if(Timezonerows[idx].InterviewerAvailability==true){
      await this.toggleTimeslotToSubmit(idx);
    }
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
        // TimezoneValue:key.TimezoneValue,
          Location:key.Location
        });
       });
    
      this.setState({
        dropdownoptions 
      });
   
  }
 
//---------------------Add Rows from the Grid on cross button click Timezone----------------------//

  public handleAddTimeZoneRow = () => {
    const item = {
      interviewStartDate: null,//new Date(), 
      interviewEndDate: null,//new Date(),
      TimeZone:"",  
      CandidateConfirmation:false,
      Onlyread:true,
      interviewerValidation:{
        isinterviewStartDate:true,   
        isinterviewEndDate: true,  
        isTimeZone:true,      
        isCandidateConfirmation:true,
      }
    };
    this.setState({
      newrows: [...this.state.newrows, item]
    });
  }

//---------------------toggle Timeslot to submit ---- not in use ----------------------//  
  public toggleTimeslotToSubmit = async (idx: any) =>{
    let Timezonerows= this.state.Timezonerows;
    Timezonerows.forEach((element ,index)=>{
      if(index==idx){
        element.InterviewerAvailability=true;
      }else{ 
        element.InterviewerAvailability=false;
      }
    });
   this.setState({
    Timezonerows
   });
  }
//---------------------toggle Candidate confirmation ---- not in use ----------------------//  
public toggleCheckbox = async (Isnew: any,idx: any) =>{
  let Timezonerows= this.state.Timezonerows;
  let newrows=this.state.newrows;
  if(Isnew){
    Timezonerows.forEach((el) =>{
    el.CandidateConfirmation=false;
  });
  newrows.forEach((element ,index)=>{
    if(index==idx){
      element.CandidateConfirmation=true;
    }else{ 
      element.CandidateConfirmation=false;
    }  
  });
  
}else{
  newrows.forEach((el) =>{
    el.CandidateConfirmation=false;
  });
  Timezonerows.forEach((element ,index)=>{
    if(index==idx){
      element.CandidateConfirmation=true;
    }else{ 
      element.CandidateConfirmation=false;
    }
   
  });
}
 this.setState({
  newrows,
  Timezonerows
 });
 
}
//---------------------Remove Rows from the Grid on cross button click----------------------//
  public handleRemoveSpecificRow = (idx) => () => {
    
    const rows = [...this.state.rows];
    
    if(rows[idx].ID != undefined){
      this.DeleterowData(rows[idx].ID);
    }
    rows.splice(idx, 1);
    this.setState({ rows });
  }

//---------------------Remove Rows from the Grid on cross button click----------------------//

    public handleRemoveSpecificTimezoneRow = (idx) => () => {
    
      const newrows = [...this.state.newrows];
      
      if(newrows[idx].ID != undefined){
        this.DeleterowData(newrows[idx].ID);
      }
      newrows.splice(idx, 1);
      this.setState({ newrows });
    }

  //Delete row from list
    public DeleterowData = async (ID) => {
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists;
      libDetails.getByTitle("InterviewerDetails").items.getById(ID).delete()
    .then(i => {
      console.log("Deleted Successfully");
    });
  }

  // -------------------- Get All interviewers Details ---------------------------------------//

  public getInterviewDetail = async () =>{
    console.log("this is in addInterViewDetails");
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    
      //console.log(el)
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists
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
    //  interviewStartDate:(element.InterviewStartDate !=null)?new Date(element.InterviewStartDate):null, 
    //  interviewEndDate:(element.InterviewEndDate !=null)?new Date(element.InterviewEndDate):null,
    //  TimeZone:element.TimeZone,
    //  SelectedByCandidate:(element.SelectedByCandidate !=null)?element.SelectedByCandidate:"False",
    //  InterviewerAvailability:(element.InterviewerAvailability !=null)?element.InterviewerAvailability:false,
    //  AddInterviewerSeq:(element.AddInterviewerSeq!=null)?element.AddInterviewerSeq:null,
    //  CandidateConfirmation:(element.CandidateConfirmation !=null)?element.CandidateConfirmation:false,
      
    };

    // if(element.AddInterviewerSeq > this.state.maxsequence){
    //   this.setState({
    //     maxsequence:element.AddInterviewerSeq
    //   }); 
    // }
    // if(element.InterviewerAvailability == true){
    //   this.setState({
    //     checkboxvalidation:true
    //   });
    // }
    // if(element.CandidateConfirmation == true){
    //   this.setState({
    //     candiConfChecked:true
    //   });
    // }

     this.setState({
       rows: [...this.state.rows, item]
     });
  }

  public getInterviewTimeDetail = async () =>{
    console.log("this is in addInterViewDetails");
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
      let libDetails = await this.state.siteabsoluteurl.lists
      .getByTitle("InterviewTimeDetails")
      .items.select("*","RequestID/ID").expand("RequestID/Title").filter("RequestID eq '" + ID + "'").get().then((results) =>{
        console.log(results);
        results.forEach(element => {
          console.log(element);  
          this.bindTimeDataRow(element);
        });
      });
  }

  public bindTimeDataRow = (element) => {
    const item = {
      interviewStartDate:(element.InterviewStartDate !=null)?new Date(element.InterviewStartDate):null, 
      interviewEndDate:(element.InterviewEndDate !=null)?new Date(element.InterviewEndDate):null, 
      TimeZone:element.TimeZone,
      // CandidateConfirmation:(element.CandidateConfirmation !=null)?element.CandidateConfirmation:false,
      SelectedByCandidate:(element.CandidateConfirmation)?"True":"False",
      InterviewerAvailability:(element.InterviewerAvailability !=null)?element.InterviewerAvailability:false,
      AddInterviewerSeq:(element.AddInterviewerSeq!=null)?element.AddInterviewerSeq:null,
      ID:element.ID,
      interviewerValidation:{
        isinterviewStartDate:(element.InterviewStartDate !=null)?true:false,   
        isinterviewEndDate: (element.InterviewEndDate !=null)?true:false,  
        isTimeZone:(element.TimeZone !="" && element.TimeZone != null)?true:false,      
       // isCandidateConfirmation:(element.CandidateConfirmation !="")?true:false, 
      }
       
    };
    if(element.AddInterviewerSeq > this.state.maxsequence){
      this.setState({
        maxsequence:element.AddInterviewerSeq
      }); 
    }
    if(element.InterviewerAvailability == true){
      this.setState({
        checkboxvalidation:true
      });
    }
    // if(element.CandidateConfirmation == true){
    //   this.setState({
    //     candiConfChecked:true
    //   });
    // }

    this.setState({
      Timezonerows: [...this.state.Timezonerows, item]
    });
  }
//--------------------Get all Details of saved Request --------------------//

  public getRequestDetail=async () =>{
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    console.log(this.state); 
    let libDetails = await this.state.siteabsoluteurl.lists
    .getByTitle("Candidate Interview Info")
    .items.getById(ID).select("*","Coordinator/ID,Coordinator/Title").expand("Coordinator").get().then((response) => {
      console.log(response);
       this.setState({
        RequestID: response.ID,
        CandidateName: response.CandidateFirstName +" "+ response.CandidateLastName,
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
        RequestStatus: response.Status
       });
    });
  }
  
 //----------------------------form validation function---------------------//

  private   formValidation = () => {
    let isValidated = true;
    const rows = [...this.state.rows];
    const Timezonerows =[...this.state.Timezonerows];
    const newrows =[...this.state.newrows];
    if(this.state.CandidateFirstName == ""){
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
    // if(this.state.HiringManager.length <= 0){
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
    rows.forEach((element,idx) => {
      
      if(rows[idx].InterviewerName == null || rows[idx].InterviewerName == "" || rows[idx].InterviewerName == undefined){
        isValidated = false;
        rows[idx].interviewerValidation.isInterviewerName =false;
     }
      if(rows[idx].InterviewerEmail == null || rows[idx].InterviewerEmail == "" || rows[idx].InterviewerEmail == undefined){
      isValidated = false;
      rows[idx].interviewerValidation.isInterviewerEmail =false;
     }
      if(rows[idx].Designation == null || rows[idx].Designation == ""  || rows[idx].Designation == undefined){
      isValidated = false;
     rows[idx].interviewerValidation.isDesignation = false;
     }
    });
    if(Timezonerows.length > 0){
      Timezonerows.forEach((element,idx) => {
      if(Timezonerows[idx].TimeZone == null || Timezonerows[idx].TimeZone == ""){
        isValidated = false;
        Timezonerows[idx].interviewerValidation.isTimeZone = false;
      }
      if(Timezonerows[idx].interviewStartDate == null){
        isValidated = false;
        Timezonerows[idx].interviewerValidation.isinterviewStartDate = false
      }
      if(Timezonerows[idx].interviewEndDate == null){
        isValidated = false;
        Timezonerows[idx].interviewerValidation.isinterviewEndDate = false;
      }
      });
    }
    else{
      isValidated = false;
    }
      newrows.forEach((element,idx) => {
      if(newrows[idx].TimeZone == null || newrows[idx].TimeZone == ""){
        isValidated = false;
        newrows[idx].interviewerValidation.isTimeZone = false;
      }
      if(newrows[idx].interviewStartDate == null){
        isValidated = false;
        newrows[idx].interviewerValidation.isinterviewStartDate = false
      }
      if(newrows[idx].interviewEndDate == null){
        isValidated = false;
        newrows[idx].interviewerValidation.isinterviewEndDate = false;
      }
      });
    
    this.setState({
      rows,
      Timezonerows,
      newrows
    })
    return isValidated;
  } 
  

  //--------------------   Add new request to the List  submitted-case  ---------------------------------//
   private async updateCandidateDetails(status){
    
    let isvalidated = this.formValidation();
    if(this.state.addmanager && this.state.isExistedEmailId){
      this.setState({isExistedEmailId:false})
      alert("Hiring Manager Email Address aleady Exist in List")
    }
    console.log(status); 
    let submittedStatus = "TS Approved";
    let submittedComment = "Waiting for timeslot approval by interviewer";
    let Runflow = (status=="Submitted") ?false: true;
    
    // if(this.state.candiConfChecked == true){
    //   submittedStatus = "TS Finalised";
    //   submittedComment="TS Finalised - Interview Scheduled"
    // } 
    let Status =(status=="Submitted" && !this.state.candiConfChecked && this.state.newrows.length >0) ?"TS Added": submittedStatus;  
    let Comment =(status=="Submitted" && !this.state.candiConfChecked && this.state.newrows.length >0) ?"Waiting for timeslot selection by candidate":submittedComment; 
    // Ts selected case no new rows and selected by candidate checked 
    // Status =(status=="Submitted" && !this.state.candiConfChecked && this.state.newrows.length >0) ?"TS Selected": submittedStatus;  
    // Comment =(status=="Submitted" && !this.state.candiConfChecked && this.state.newrows.length >0) ?"Waiting for timeslot approval by interviewer":submittedComment; 
    
    let TimeslotAcceptedDatetime =(status=="Submitted" && !this.state.candiConfChecked) ?null:new Date(); 
    let TimeslotAddedDatetime =(status=="Submitted" && !this.state.candiConfChecked) ?new Date():null; 
      if(isvalidated){
        if(this.state.addmanager){
          await this.addHiringMananageToMasterList();
        }
        if(Status == "TS Approved" &&(this.state.checkboxvalidation || this.state.candiConfChecked)){
              let queryParams = new URLSearchParams(window.location.search);
              let ID = parseInt(queryParams.get("Req")); 
            // let web = new Web(this.props.siteUrl);
              let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info")
                  .items.getById(ID).update({

                    CandidateFirstName : this.state.CandidateFirstName ,
                    CandidateLastName : this.state.CandidateLastName, 
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
                    Comment: Comment,
                    TimeslotAcceptedDatetime:TimeslotAcceptedDatetime,
                    TimeslotAddedDatetime:TimeslotAddedDatetime,
                    Status:Status,
                    Runflow:Runflow,
                    Notes:this.state.Notes,
                    CVURL:this.state.CVURL,
                });
              
                await this.addInterviewDetail();
                await this.updateTimeSlot();
                
                    let newInterviewers=this.state.newrows;
                    if(newInterviewers.length > 0){
                        await this.addNewTimeslot();
                        //await this.addNewInterviewer();
                      }
                      await this.isModalOpen(" All Interviewer Details are updated !",true); 
        }
        else if(Status=="TS Added" ){
          submittedStatus = "TS Approved";
          submittedComment = "Waiting for timeslot approval by interviewer";
          Status =(Status=="TS Added" && !this.state.candiConfChecked && this.state.newrows.length >0) ?"TS Added": submittedStatus;  
          let Comment =(Status=="TS Added" && !this.state.candiConfChecked && this.state.newrows.length >0) ?"Waiting for timeslot selection by candidate":submittedComment; 
          let queryParams = new URLSearchParams(window.location.search);
              let ID = parseInt(queryParams.get("Req")); 
              let web = new Web(this.props.siteUrl);
              let libDetails = await web.lists.getByTitle("Candidate Interview Info")
                  .items.getById(ID).update({
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
                    Comment: Comment,
                    Status:Status,
                    Runflow:Runflow,
                    Notes:this.state.Notes,
                    CVURL:this.state.CVURL,
                    TimeslotAcceptedDatetime:TimeslotAcceptedDatetime,
                    TimeslotAddedDatetime:TimeslotAddedDatetime,
                });
              
                await this.addInterviewDetail();
                await this.updateTimeSlot();
                
                    let newInterviewers=this.state.newrows;
                    if(newInterviewers.length > 0){
                        await this.addNewTimeslot();
                      }
                      await this.isModalOpen(" All Interviewer Details are updated !",true); 

        }
        else{
          await this.isModalOpen("Please give your confirmation before approve !",false);
        }
    }
            
  }
 //------------------update Time Slot-----------------------------------//   
   public updateTimeSlot= async() =>{
      console.log("this is in addInterViewDetails");
      let interviewers=this.state.Timezonerows;
      for (let index = 0; index < interviewers.length; index++) {
        let el = interviewers[index];
        console.log(el);
        let web = new Web(this.props.siteUrl);
        let libDetails = await web.lists.getByTitle("InterviewTimeDetails")
        .items.getById(el.ID).update({
            InterviewerAvailability:el.InterviewerAvailability,	
           // CandidateConfirmation:el.CandidateConfirmation,									 
          });
        
      }
     
    }

    //---------------------------- Add New Hiring Manager to HiringManagerMasterList --------------------//
    
    private addHiringMananageToMasterList = async () =>{
      console.log("this is in addInterViewDetails");
      let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("HiringManagerMasterList") 
      .items.add({
        HiringManagers:this.state.NewHiringManager,
        HiringManagerDesignation:this.state.HiringManagerJobtitle,
        HiringManagersEmailId:this.state.HiringManagerEmail
      });
      this.setState({
        NewHiringManagerID:(libDetails.data.ID).toString(),
      })
  }
//------------------ Add interviewer Details to list ----------------------//

    public addInterviewDetail=async () =>{
      console.log("this is in addInterViewDetails");
      let interviewers=this.state.rows;
      interviewers.forEach(async (el)=>{
        console.log(el);
        let libDetails = this.state.siteabsoluteurl.lists.getByTitle("InterviewerDetails");
        if(el.ID == undefined){
          await libDetails.items.add({
            Title: el.InterviewerName,
            InterViewerDesignation: el.Designation,
            InterviewerEmail:el.InterviewerEmail,
            RequestIDId:this.state.RequestID
          });
        }
        else{
          await libDetails.items.getById(el.ID).update({
            Title: el.InterviewerName,
            InterViewerDesignation: el.Designation,
            InterviewerEmail:el.InterviewerEmail,
          });
        }
      });    
    }

    public addNewTimeslot=async() =>{
      console.log("NEW INTERVIEWER DETAIL");
      let newInterviewers=this.state.newrows;
      newInterviewers.forEach(async (el)=>{
        console.log(el);
        let web = new Web(this.props.siteUrl);
        let libDetails = await web.lists.getByTitle("InterviewTimeDetails")
        .items.add({
			      InterviewStartDate: new Date(el.interviewStartDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            InterviewEndDate: new Date(el.interviewEndDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            TimeZone:el.TimeZone !=null?el.TimeZone:"Eastern Standard Time",
            AddInterviewerSeq: this.state.maxsequence + 1,		
            CandidateConfirmation:el.CandidateConfirmation,											 
            RequestIDId:this.state.RequestID
          });
      });   
    }

   
    //----------------------------Model box ---------------------------------------//

    public isModalOpen = async(message:any,accept:boolean) => {
    
      this.setState({
        isModalOpen:true,
        modalmessage:message,
        accepticon:accept,
      });
    }
  //----------------------------Model box ---------------------------------------//

  public reload = async () =>{
    const myTimeout = setTimeout(window.location.href=this.props.siteUrl+"/SitePages/Dashboard.aspx", 2000);
  }
  //--------------------Modal Close ------------------------------//

  public isModalClose = async() => {
      this.setState({isModalOpen:false});
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
  
  public render(): React.ReactElement<ICiInterviewSlotProps> {
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
          <h2 className={styles.header}>Interview Time Slots</h2>
        </div>
        <div className={styles['grid-child-element']}>
           <img src={require('../assets/homeicon.png')} className={styles.homeIcon}  onClick={this.reload}/></div>
      </div>
          
          <Modal isOpen={this.state.isModalOpen} isBlocking={false} className={styles.custommodalpopup} >
            <div className='modal-dialog modal-help' style={{width: '520px', height: '170px',}}>
              <div className='modal-content'>
                  <div className={styles['modal-body']}><span ><h2 className='modalmessage'>{this.state.modalmessage}</h2></span>
                    <div>
                      {this.state.accepticon ? <img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/>:<img src={require('../assets/cancel.png')} className={styles.imgcheckIcon}/>}
                    </div>
                  </div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{ this.reload();}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
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
              name="RequisitionID" 
              className={styles.inputtext} 
              onChange={(e)=>{
                this.setState({
                  RequisitionID : e.target.value,
                  isRequisitionID:(e.target.value) != "" ?true:false
                  });
                }} 
                value={this.state.RequisitionID} required={true}/>    
              {(!this.state.isRequisitionID)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}          
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Requisition Title</span>                
            </div>
            <div className={styles.columnright}>  
            <input type="text" 
              className={styles.inputtext} 
              onChange={(e)=>{
                this.setState({
                  JobTitle : e.target.value,
                  isJobTitle:(e.target.value) != "" ?true:false
                });    
              }} 
              value={this.state.JobTitle} required={true}/>  
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
             onChange={(e)=>{
              this.setState({
                CandidateFirstName : e.target.value,
                isCandidateFirstName:(e.target.value) != "" ?true:false
              });
            }}
               value={this.state.CandidateFirstName} required={true}/>                
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
               onChange={(e)=>{
                this.setState({
                  CandidateLastName : e.target.value,
                  isCandidateLastName:(e.target.value) != "" ?true:false
                });
              }}
              value={this.state.CandidateLastName}
              required={true}/>                
              {(!this.state.isCandidateLastName)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}              
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Email</span>                
            </div>
            <div className={styles.columnright}>   
            <input type="email" 
              className={styles.inputtext} 
              onChange={(e)=>{
                this.setState({
                  CandidateEmail : e.target.value,
                  isCandidateEmail:(e.target.value) != "" ?true:false
                });
              }}  
              value={this.state.CandidateEmail} 
              required={true}/> 
             {(!this.state.isCandidateEmail)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}              
            </div>
          </div>
       
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Candidate ID</span>                
            </div>
            <div className={styles.columnright}>      
            <input type="text" 
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
              {(!this.state.isCandidateTimezone)?<div className={styles.row}><span className={styles.requiredfield} >Select Time Zone!</span></div>:null}                        
            </div>
          </div>

         
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
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
            </div>
          </div>
          {this.state.IshiringManagerInterviewer?<div><div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Hiring Manager Job Title</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" 
           // readOnly = {this.state.HiringManagerJobtitle == ""?false:true}
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
                      isHiringManagerEmail:(e.target.value) != "" ?true:false
                    // }
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
              <span>Notes</span>               
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
                   
                    {/* {(this.state.Status == "Submitted" || this.state.Status == "TS Added")? */}
                    <th className="text-center">
                      <img src={require('../assets/plus.png')} className={styles.imgTableIcon}  onClick={this.handleAddRow}/>
                    </th>	
                    {/* :null} */}
                    </tr>
                    
                    {this.state.rows.map((item, idx) => (
                      <tr id="addr0" key={idx}>
                        <td>
                          <input
                          required={true}
                            type="text"
                            name="InterviewerName"
                            value={this.state.rows[idx].InterviewerName }
                            onChange={this.handleChange(idx,"InterviewerName")}
                            className="form-control"
                          />
                         {(!this.state.rows[idx].interviewerValidation.isInterviewerName)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                        </td>
                        <td>
                        <input
                          required={true}
                          type="text"
                          name="InterviewerEmail"
                          value={this.state.rows[idx].InterviewerEmail }
                          onChange={this.handleChange(idx,"InterviewerEmail")}
                          className="form-control"
                        />
                        {(!this.state.rows[idx].interviewerValidation.isInterviewerEmail)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                      
                        <td>
                          <input
                            type="text"
                            name="Designation"
                            value={this.state.rows[idx].Designation}
                            onChange={this.handleChange(idx,"Designation")}
                            className="form-control"
                          />
                           {(!this.state.rows[idx].interviewerValidation.isDesignation)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                        </td>
                        {/* {(this.state.Status == "Submitted" || this.state.Status == "TS Added")? */}
                        <td><img src={require('../assets/cross.png')} className={styles.imgTableIcon}  onClick={this.handleRemoveSpecificRow(idx)}/></td>
                        {/* // :null} */}
                      </tr>
                    ))} 

              </table>  
              <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
         
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span><b>Available Time Slots</b></span>                
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
                  <table className={styles.interviewers}>
                     {/* <thead className='newInterviewerthead'> */}
                     <tr>
                    <th className="text-center"> Start Date & Time
                      <div title={this.informationmessge.InterviewStartDate} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div>
                    </th>
                    <th className="text-center"> End Date & Time
                      <div title={this.informationmessge.InterviewEndDate} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div>
                   </th>
                    <th className="text-center"> TimeZone
                      <div title={this.informationmessge.Timezone} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
                    <th className="text-center"> Candidate Available
                        <div title={this.informationmessge.CandidateAvailable} className={styles.theadicon}>
                          <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                        </div> 
                      </th>	
                      <th className="text-center"> Time slot to submit
                        <div title={this.informationmessge.submittimeslot} className={styles.theadicon}>
                          <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                        </div> 
                      </th>
                        </tr>
                      {this.state.Timezonerows.map((item, idx) => (
                        <tr id="addr0" key={idx}>
                          <td>
                            <DatePicker  

                                selected={ this.state.Timezonerows[idx].interviewStartDate }  
                                onChange={ this.handleTimeRowChange(idx,"interviewStartDate") }
                                minDate={new Date()}
                                name="interviewStartDate"  
                                showTimeSelect
                                dateFormat="MM/dd/yyyy hh:mm a"  
                            />  
                          </td>
                          <td>
                            <DatePicker  
                                selected={ this.state.Timezonerows[idx].interviewEndDate }  
                                onChange={ this.handleTimeRowChange(idx,"interviewEndDate") }  
                                minDate={this.state.Timezonerows[idx].interviewStartDate}
                                name="interviewEndDate"  
                                showTimeSelect
                                dateFormat="MM/dd/yyyy hh:mm a"  
                            />  
                          </td>
                          <td>
                        <select 
                              
                               name="TimeZone"
                              value={this.state.Timezonerows[idx].TimeZone}
                              
                              onChange={this.handleTimeRowChange(idx,"TimeZone")}
                              className="form-control">
                              <option value="">Select Time Zone</option>
                          {this.state.dropdownoptions.map((newitem) => (<option value={newitem.Title}>{newitem.Location}</option>))}
                          </select>
                        </td>
                        <td> 
                        <div className={this.state.Timezonerows[idx].SelectedByCandidate == "True"?styles.Available:styles.notAvailable}></div>
                        </td>
                        <td>
                          {/* Latest added and selected time slot should be visible  */}
                          {this.state.maxsequence==this.state.Timezonerows[idx].AddInterviewerSeq && this.state.Timezonerows[idx].SelectedByCandidate == "True"?<input
                              type="checkbox"
                              name="InterviewerAvailability"
                              checked={this.state.Timezonerows[idx].InterviewerAvailability}
                              onChange={this.handleTimeRowChange(idx,"InterviewerAvailability")}
                              className="form-control"
                            />:null}
                        </td>
                        </tr>
                      ))}
                  </table>  
                   {/* {  (this.state.RequestStatus == "TS Finalised" || this.state.RequestStatus == "TS Approved")? null:  */}
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>  
             {(this.state.newrows.length == 0)?<button className={styles.submitButton} name="AddMore" onClick={this.handleAddTimeZoneRow}>Add More</button>:null }
             {(this.state.newrows.length == 0)?<button className={styles.submitButton} name="Submit" onClick={() => this.updateCandidateDetails("Approved")}>Approve</button>:null}   
             {(this.state.newrows.length == 0)?<button className={styles.submitButton} name="Cancel"onClick={() => this.reload()}>Cancel</button>:null}                                
            </div>
          </div>
           {/* } */}
          
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
           {(this.state.newrows.length > 0)?
                  <table className={styles.interviewers}>
                     <tr>
                    <th className="text-center"> Start Date & Time
                      <div title={this.informationmessge.InterviewStartDate} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div>
                    </th>
                    <th className="text-center"> End Date & Time
                      <div title={this.informationmessge.InterviewEndDate} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div>
                   </th>
                    <th className="text-center"> TimeZone
                      <div title={this.informationmessge.Timezone} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
                    <th className="text-center"> Candidate Confirmation
                      <div title={this.informationmessge.CandidateConfirmation} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
                          <th className="text-center"><img src={require('../assets/plus.png')} className={styles.imgTableIcon}  onClick={this.handleAddTimeZoneRow}/></th>	
                        </tr>
                      {this.state.newrows.map((item, idx) => (
                        <tr id="addr0" key={idx}>
                          <td>
                            <DatePicker  
                              
                                selected={ this.state.newrows[idx].interviewStartDate }  
                                onChange={ this.handlenewRowChange(idx,"interviewStartDate") }
                                minDate={new Date()}
                                name="interviewStartDate"  
                                showTimeSelect
                                dateFormat="MM/dd/yyyy hh:mm a"  
                            />  
                            {(!this.state.newrows[idx].interviewerValidation.isinterviewStartDate)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                          </td>
                          <td>
                            <DatePicker  
                                readOnly={this.state.newrows[idx].Onlyread}
                                selected={ this.state.newrows[idx].interviewEndDate }  
                                onChange={ this.handlenewRowChange(idx,"interviewEndDate") }  
                                minDate={this.state.newrows[idx].interviewStartDate}
                                name="interviewEndDate"  
                                showTimeSelect
                                dateFormat="MM/dd/yyyy hh:mm a"  
                            />  
                             {(!this.state.newrows[idx].interviewerValidation.isinterviewEndDate)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                          </td>
                          <td>
                        <select  name="TimeZone"
                              value={this.state.newrows[idx].TimeZone}
                              onChange={this.handlenewRowChange(idx,"TimeZone")}
                              className="form-control">
                          <option value="">Select Time Zone</option>
                          {this.state.dropdownoptions.map((newitem) => (<option value={newitem.Title}>{newitem.Location}</option>))}
                          </select>
                           {(!this.state.newrows[idx].interviewerValidation.isTimeZone)?<div><span className={styles.requiredfield} >Select Time Zone!</span></div>:null}
                        </td>
                          <td>
                         <input
                              type="checkbox"
                              name="CandidateConfirmation"
                              checked={this.state.newrows[idx].CandidateConfirmation}
                              onChange={this.handlenewRowChange(idx,"CandidateConfirmation")}
                              className="form-control"
                            />
                      </td>
                          <td><img src={require('../assets/cross.png')} className={styles.imgTableIcon}  onClick={this.handleRemoveSpecificTimezoneRow(idx)}/></td>
                        </tr>
                      ))}
                  </table>              
            :null}
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>   
             {(this.state.newrows.length > 0)? <button className={styles.submitButton} name="Submit"onClick={() => this.updateCandidateDetails("Submitted")}>Submit</button>:null}
             {(this.state.newrows.length > 0)?<button className={styles.submitButton} name="Cancel"onClick={() => this.reload()}>Cancel</button>:null}
            </div>
          </div>
        </div>
    );
  }
}
