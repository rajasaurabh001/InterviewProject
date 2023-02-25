import * as React from 'react';
import styles from './CiCandidateScreen.module.scss';
import { ICiCandidateScreenProps } from './ICiCandidateScreenProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, SearchQuery, SearchResults, ItemAddResult } from "sp-pnp-js";
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $  from 'jquery';
import 'jqueryui';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { forEach } from 'jszip';


export interface ICiCandidateScreenState {
  rows: any;
  RequestID:any;
  CandidateFirstName :string;
  CandidateLastName:string;
  CandidateName:string;
  CandidateEmail:string;
  AdditionalDetails:string;
  JobTitle:string;
  // Position:string;
  HiringManager:any;
  DefaultHiringManager:any;
  RequisitionID:string;
  JobDetails:string;
  Status:string;
  candiConfChecked:boolean;
  dropdownoptions:any;
  isModalOpen:boolean;
  modalmessage:string;
  coordinator:string;
  isCandidateFirstName:boolean;
  isCandidateLastName:boolean;
  isCandidateEmail:boolean;
  isAdditionalDetails:boolean;
  isJobTitle:boolean;
  isRequisitionID:boolean;
  isHiringManager:boolean;
  siteabsoluteurl:Web;
}

export default class CiCandidateScreen extends React.Component<ICiCandidateScreenProps, ICiCandidateScreenState> {

  constructor(props:ICiCandidateScreenProps, state:ICiCandidateScreenState) {
    super(props);
    this.state ={
      rows: [],
      RequestID:"",
      CandidateFirstName  : "",
      CandidateLastName  : "",
      CandidateName : "",
      CandidateEmail:"",
      AdditionalDetails:"",
      JobTitle:"",
      // Position:"",
      coordinator:"",
      HiringManager:[],
      DefaultHiringManager:[],
      RequisitionID:"",
      JobDetails:"",
      Status:"",
      candiConfChecked:false,
      dropdownoptions:[],
      isModalOpen:false,
      modalmessage:"",
      isCandidateFirstName :true,
      isCandidateLastName :true,
      isCandidateEmail:true,
      isAdditionalDetails: true,
      isJobTitle: true,
      isRequisitionID: true,
      isHiringManager:true,
      siteabsoluteurl:new Web(this.props.siteUrl),
    };
    
  }
  public informationmessge={
    Interviewname:"hello Interviewname",
    InterviewEmail:"hello Interview Email",
    InterviewerJobTitle:"Interviewer job title",
    InterviewStartDate:"Interveiw Start date",
    InterviewEndDate:"Interveiw End Date",
    Timezone:"Time of interviewer",
    CandidateConfirmation:"Candidate Confirmation of Interviewer"
  };
  // handleCanditeDetails=(e)=>{
  //   const {value} = e.target;
  //   this.setState({
  //     JobDetails : value,
  //   });
  //   console.log(this.state);
  // }
  private _getPeoplePickerItems = (items: any[]) =>{
    console.log('Items:', items);
    let tempuser :any[]=[];
    items.map((item) =>{
    tempuser.push(item.id);
  // console.log(item.id)
});
this.setState({
  HiringManager : tempuser ,
  isHiringManager:(items.length > 0) ?true:false
  
});

console.log(this.state);
}
  public handleChange = (idx,elementName) => async (event) => {
    // const { name, value } = event.target;
    let ele =elementName;
    const rows = [...this.state.rows];
    if(elementName=="interviewStartDate"){
      rows[idx].interviewStartDate = event;
      rows[idx].interviewerValidation.isinterviewStartDate =(event != null)?true:false
      rows[idx].Onlyread = false;
    }else if(elementName=="interviewEndDate"){
      rows[idx].interviewEndDate = event;
      rows[idx].interviewerValidation.isinterviewEndDate =(event != null)?true:false
    }else if(elementName=="CandidateConfirmation"){
      rows[idx].CandidateConfirmation = event.target.checked;
      if(event.target.checked){
        this.setState({
          candiConfChecked:true
        });
      }else{
        this.setState({
          candiConfChecked:false
        });
      }
    }
    else{
      const { name, value } = event.target;
      const rowInfo = rows[idx];
      rowInfo[name] = value;
      rowInfo["interviewerValidation"]["is"+name] =(event.target.value != "") ? true:false
    }
    this.setState({
      rows
    });
    if(rows[idx].CandidateConfirmation==true){
      await this.toggleCheckbox(false,idx);
    }
    //console.log(this.state);
  }
  public handleAddRow = () => {
    const item = {
      InterviewerName: "",
      
      Designation: "",
      InterviewerEmail:"",
      interviewStartDate: null,//new Date(), 
      interviewEndDate: null,//new Date(),
      TimeZone:"Eastern Standard Time",  
      CandidateConfirmation:false,
      Onlyread:true,
      interviewerValidation:{
        isInterviewerName:true,
        isInterviewerEmail:true,   
        isDesignation:true,  
        isinterviewStartDate:true,   
        isinterviewEndDate: true,  
        isTimeZone:true,      
        isCandidateConfirmation:true,
      }
    };
    this.setState({
      rows: [...this.state.rows, item]
    });
  }
  public toggleCheckbox = async (Isnew: any,idx: any) =>{
    let rows= this.state.rows;
    rows.forEach((element,index) =>{
      if(index==idx){
        element.CandidateConfirmation=true;
      }else{ 
        element.CandidateConfirmation=false;
      }
    });

    this.setState({
      rows
     });
   
  }
   
  

  // handleRemoveRow = () => {
  //   this.setState({
  //     rows: this.state.rows.slice(0, -1)
  //   });
  // };


  //need to understand
  public handleRemoveSpecificRow = (idx) => () => {
    
    const rows = [...this.state.rows];
    
    if(rows[idx].ID != undefined){
      this.DeleterowData(rows[idx].ID);
    }
    rows.splice(idx, 1);
    this.setState({ rows });
  }

  //Delete row from list
  public  DeleterowData = async (ID) => {
      // let web = new Web(this.props.siteUrl);
      let libDetails = await this.state.siteabsoluteurl.lists;
      libDetails.getByTitle("InterviewerDetails").items.getById(ID).delete()
    .then(i => {
      console.log("Deleted Successfully");
    });
    //alert("Deleted Successfully");
  }

  public async componentDidMount(){
    this.getRequestDetail();
    this.getInterviewDetail();
    this.GetTimeZone();
    $("[class*='ms-OverflowSet ms-CommandBar-primaryCommand primarySet']").first().css( "display", "none" );
    $("[data-automation-id=pageHeader]").hide();
    $('#CommentsWrapper').hide();
    $('.CanvasZone div').eq(0).removeAttr('class');
   // this.addInterviewDetail();
    
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
      interviewStartDate:(element.InterviewStartDate !=null)?new Date(element.InterviewStartDate):null, 
      interviewEndDate:(element.InterviewEndDate !=null)?new Date(element.InterviewEndDate):null, 
      TimeZone:element.TimeZone,
      CandidateConfirmation:(element.CandidateConfirmation !=null)?element.CandidateConfirmation:false,
      SelectedByCandidate:(element.CandidateConfirmation)?"True":"False",
      ID:element.ID,
      interviewerValidation:{
        isInterviewerName:(element.Title !="" && element.Title !=null)?true:false, 
        isInterviewerEmail:(element.InterviewerEmail !="" && element.InterviewerEmail !=null)?true:false,     
        isDesignation:(element.InterViewerDesignation != "" && element.InterViewerDesignation !=null)?true:false,  
        isinterviewStartDate:(element.InterviewStartDate !=null)?true:false,   
        isinterviewEndDate: (element.InterviewEndDate !=null)?true:false,  
        isTimeZone:(element.TimeZone !="" && element.TimeZone != null)?true:false,      
        isCandidateConfirmation:(element.CandidateConfirmation !="")?true:false, 
      }
       
    };
    this.setState({
      rows: [...this.state.rows, item]
    });
    if(element.CandidateConfirmation == true){
      this.setState({
        candiConfChecked:true
      });
    }
  }
  private   formValidation = () => {
    let isValidated = true;
    const rows = [...this.state.rows];
    if(this.state.CandidateFirstName == ""){
      isValidated =false;
      this.setState({isCandidateFirstName:false});
      // $("#val_CandidateFirstName").css( "display", "block" );
    }
    if(this.state.CandidateLastName == ""){
      isValidated =false;
      this.setState({isCandidateLastName:false});
      // $("#val_CandidateLastName").css( "display", "block" );
    }
    if(this.state.CandidateEmail == ""){
      isValidated =false;
      this.setState({isCandidateEmail:false});
      // $("#val_CandidateEmail").css( "display", "block" );
    }
    if(this.state.AdditionalDetails == ""){
      isValidated =false;
      this.setState({isAdditionalDetails:false});
      // $("#val_AdditionalDetails").css( "display", "block" );
    }
    if(this.state.JobTitle == ""){
      isValidated =false;
      this.setState({isJobTitle:false});
      // $("#val_JobTitle").css( "display", "block" );
    }
    if(this.state.RequisitionID == ""){
      isValidated =false;
      this.setState({isRequisitionID:false});
      // $("#val_RequisitionID").css( "display", "block" );
    }
    if(this.state.HiringManager.length  <= 0){
      isValidated =false;
      this.setState({isHiringManager :false});
      // $("#val_HiringManager").css( "display", "block" );
    }
    rows.forEach((element,idx) => {
      
     if(rows[idx].InterviewerName == null || rows[idx].InterviewerName == ""){
        isValidated = false;
        rows[idx].interviewerValidation.isInterviewerName =false;
        // (rows[idx].InterviewerName != null || rows[idx].InterviewerName != "")?true:false
     }
     if(rows[idx].InterviewerEmail == null || rows[idx].InterviewerEmail == ""){
      isValidated = false;
      rows[idx].interviewerValidation.isInterviewerEmail =false;
      // (rows[idx].InterviewerEmail != null || rows[idx].InterviewerEmail != "")?true:false
     }
     if(rows[idx].TimeZone == null || rows[idx].TimeZone == ""){
      isValidated = false;
      rows[idx].interviewerValidation.isTimeZone = false;
      // (rows[idx].TimeZone != null || rows[idx].TimeZone != "")?true:false
     }
     if(rows[idx].Designation == null || rows[idx].Designation == ""){
      isValidated = false;
      rows[idx].interviewerValidation.isDesignation = false;
      // (rows[idx].Designation != null || rows[idx].Designation != "")?true:false
     }
     if(rows[idx].interviewStartDate == null){
      isValidated = false;
      rows[idx].interviewerValidation.isinterviewStartDate = false
      // (rows[idx].interviewStartDate != null)?true:false
     }
     if(rows[idx].interviewEndDate == null){
      isValidated = false;
      rows[idx].interviewerValidation.isinterviewEndDate = false;
      // (rows[idx].interviewEndDate != null)?true:false
     }

    });
    this.setState({
      rows
    })
    return isValidated;
  } 

  private async updateCandidateDetails(status){
    let isvalidated = this.formValidation();
    console.log(status);
    let submittedStatus = "TS Added";
    let submittedComment = "Waiting for timeslot selection by candidate";
    let Runflow =  false;
    if(this.state.candiConfChecked == true){
      submittedStatus = "TS Selected";
      submittedComment="Waiting for timeslot approval by interviewer";
      Runflow =  true;
    }  
    let Status = submittedStatus;  
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    // let web = new Web(this.props.siteUrl);
    let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info");
    if(isvalidated){
    if(Status=="TS Selected"){//In Case of  TS Approved
        libDetails.items.getById(ID).update({
          CandidateFirstName : this.state.CandidateFirstName ,
          CandidateLastName : this.state.CandidateLastName, 
          Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          // Position: this.state.Position,
          RequisitionID: this.state.RequisitionID,
          HiringManagerId: this.state.HiringManager[0],
          Comment:submittedComment,
          Status:Status,
          RunProcess:true,
          TimeslotAcceptedDatetime:new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
      });
    }
    else if(Status=="TS Added"){//In Case of  TS ADDED
      libDetails.items.getById(ID).update({
        CandidateFirstName : this.state.CandidateFirstName ,
        CandidateLastName : this.state.CandidateLastName, 
        Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
        CandidateEmail: this.state.CandidateEmail,
        AdditionalDetails: this.state.AdditionalDetails,
        JobTitle: this.state.JobTitle,
          // Position: this.state.Position,
        RequisitionID: this.state.RequisitionID,
        HiringManagerId: this.state.HiringManager[0],
        Comment:submittedComment,
        Status:Status,
        RunProcess:true,
        TimeslotAddedDatetime:new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
      });      
    }

    await this.addInterviewDetail();
    let message = "All Interviewer Details are updated !";
    this.isModalOpen(message); 
  }
    // let confirmation=confirm("All Interviewer Details are updated");
    // const myTimeout = setTimeout(this.reload, 2000);

  }

  private async DraftCandidateDetails(){
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info").items.getById(ID)
    .update({
            CandidateFirstName : this.state.CandidateFirstName ,
            CandidateLastName :this.state.CandidateLastName, 
            Title: this.state.CandidateFirstName + " " +this.state.CandidateLastName,
            CandidateEmail: this.state.CandidateEmail,
            AdditionalDetails: this.state.AdditionalDetails,
            JobTitle: this.state.JobTitle,
            HiringManagerId: this.state.HiringManager[0],
            // Position: this.state.Position,
            RequisitionID: this.state.RequisitionID,
          }); 
    await this.addInterviewDetail();
    let message = "All Interviewer Details are updated !";
    this.isModalOpen(message); 
  }

    public addInterviewDetail=async () =>{
      console.log("this is in addInterViewDetails");
      let interviewers=this.state.rows;
      interviewers.forEach(async (el)=>{
        console.log(el);
        // let web = new Web(this.props.siteUrl);
        let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("InterviewerDetails");
        if(el.ID == undefined){
          libDetails.items.add({
            Title: el.InterviewerName,
            InterViewerDesignation: el.Designation,
            InterviewerEmail:el.InterviewerEmail,
			      InterviewStartDate: new Date(el.interviewStartDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            InterviewEndDate: new Date(el.interviewEndDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),	
            TimeZone:el.TimeZone !=null?el.TimeZone:"Eastern Standard Time",
            CandidateConfirmation:el.CandidateConfirmation,			
            SelectedByCandidate:(el.CandidateConfirmation)?"True":"False",				 
            RequestIDId:this.state.RequestID
          });
        }
        else{
          libDetails.items.getById(el.ID).update({
            Title: el.InterviewerName,
            InterViewerDesignation: el.Designation,
            InterviewerEmail:el.InterviewerEmail,
			      InterviewStartDate:new Date(el.interviewStartDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            InterviewEndDate:new Date(el.interviewEndDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            TimeZone:el.TimeZone !=null?el.TimeZone:"Eastern Standard Time",
            SelectedByCandidate:(el.CandidateConfirmation)?"True":"False",
            CandidateConfirmation:el.CandidateConfirmation,	
            //RequestIDId:this.state.RequestID
          });
        }
      });    
    }
    public isModalOpen = async(message:any) => {
      this.setState({isModalOpen:true,
        modalmessage:message,
      });
    }
    public reload =() =>{
      if(this.state.modalmessage == "Request is assingned to you!"){
        window.location.reload();
      }else{
        const myTimeout = setTimeout(window.location.href=this.props.siteUrl+"/SitePages/Dashboard.aspx", 2000);
      }
      // window.location.reload();
      
    }
    public async getRequestDetail(){
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    console.log(this.state); 
    // let web = new Web(this.props.siteUrl);
    let libDetails = await this.state.siteabsoluteurl.lists
    .getByTitle("Candidate Interview Info")
   // .select("ID,CandidateFirstName,CandidateLastName,CandidateEmail,InterviewerName,InterviewerEmail,AdditionalDetails,JobTitle,HiringManager/Title,HiringManager/EMail,RequisitionID,Status").expand("HiringManager").
    .items.getById(ID).select("*","HiringManager/Title,HiringManager/EMail,Coordinator/ID,Coordinator/Title").expand("Coordinator,HiringManager").get().then((response) => {
      console.log(response);
       this.setState({
        RequestID: response.ID,
        CandidateName: response.CandidateFirstName +" "+ response.CandidateLastName,
        CandidateFirstName : response.CandidateFirstName ,
        CandidateLastName : response.CandidateLastName, 
        CandidateEmail: response.CandidateEmail,
        AdditionalDetails: response.AdditionalDetails,
        JobTitle: response.JobTitle,
        HiringManager:response.HiringManagerId != null?[...this.state.HiringManager,response.HiringManagerId]:[],
        DefaultHiringManager: response.HiringManagerId != null?[...this.state.DefaultHiringManager,response.HiringManager.EMail]:[],
        coordinator:response.CoordinatorId != null ?response.Coordinator.Title:"",
        // Position: response.Position,
        RequisitionID: response.RequisitionID,
        Status: response.Status
       });
    });
  }
  private async GetTimeZone() {
    // let web = new Web(this.props.siteUrl);
    let timezones = await this.state.siteabsoluteurl.lists
      .getByTitle("TimeZone MasterList")
      .items
      //.select("ID","Title","Interviewer")
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
  
  public render(): React.ReactElement<ICiCandidateScreenProps> {
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/smoothness/jquery-ui.min.css');
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
              <div className={styles.pageheader}><h2 className={styles.header}>Send Time Slots to Candidates</h2></div>              
              <div><button type ="button" className={styles.submitAssign} style={{ display: (this.state.coordinator == "" ? 'block' : 'none') }} name="AssignRequest" onClick={() => this.assignCoordinator()}>Assign Request To Me</button></div>
              <div className={styles.AssignMsg} style={{ display: (this.state.coordinator != "" ? 'block' : 'none') }}>
                <span>This request is Assigne to : {this.state.coordinator}</span>
              </div>
            </div>
            <div className={styles['grid-child-element']}>
            {/* <button type ="button" className={styles.submitButton} name="AssignRequest" onClick={() => this.assignCoordinator()}>Assign Request</button> */}
            </div>
            
            <div className={styles['grid-child-element']}> 
            
            <img src={require('../assets/homeicon.png')} className={styles.homeIcon}  onClick={this.reload}/></div>
          </div>
         <Modal isOpen={this.state.isModalOpen} isBlocking={false} className={styles.custommodalpopup} >
            <div className='modal-dialog modal-help' style={{width: '500px', height: '170px',}}>
              <div className='modal-content'>
                {/* <div className={styles['modal-header']}>
                  <h3 className='modal-title'></h3>
                </div> */}
                <div className={styles['modal-body']}><span ><h2>{this.state.modalmessage}</h2></span>
                <div><img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/></div></div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{this.reload();}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
                </div>
              </div>
            </div>          
          </Modal>
          <div>
          {/* <form action="" onSubmit={() =>this.updateCandidateDetails("Submitted")}> */}
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span>Candidate Details</span>               
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
          {/* <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Name</span>                
            </div>
            <div className={styles.columnright}>
            <input type="text" className={styles.inputtext}  onChange={(e)=>{this.setState({CandidateName : e.target.value});}}  value={this.state.CandidateName} required={true}/>                
            </div>
          </div> */}
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
              value={this.state.AdditionalDetails} 
              required={true}/>    
                {(!this.state.isAdditionalDetails)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}                      
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span>Position Details</span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Job Title</span>                
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
          {/* <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Position</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({Position : e.target.value});}} value={this.state.Position} required={true}/>              
            </div>
          </div> */}
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
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Hiring Manager</span>                
            </div>
            <div className={styles.columnright}>    
              <PeoplePicker
                context={this.props.context}
                peoplePickerWPclassName={styles.peoplepicker}  
                //titleText="People Picker"
                personSelectionLimit={1}
                groupName={""} // Leave this blank in case you want to filter from all users
                showtooltip={true}
                required={true}
                disabled={false}
                onChange={this._getPeoplePickerItems}
                defaultSelectedUsers={this.state.DefaultHiringManager}
                showHiddenInUI={false}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000} 
                ensureUser={true}
              />
           {(!this.state.isHiringManager)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null} 
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span>Available time slots</span>                
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
            <table className={styles.interviewers} >
                 {/* // className="table table-bordered table-hover"
                // id="dtDetails"
                <thead> */}
                  <tr>
                    <th className="text-center"> Interviewer Name 
                      <div title={this.informationmessge.Interviewname} className={styles.theadicon}>
                          <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                        </div>
                    </th>
                    <th className="text-center"> Interview email address
                      <div title={this.informationmessge.InterviewEmail} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
                    <th className="text-center"> Interviewer Job Title
                      <div title={this.informationmessge.InterviewerJobTitle} className={styles.theadicon}>
                        <img src={require('../assets/infoicon.png')} className={styles.informationIcon}/>
                      </div> 
                    </th>
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
                    {(this.state.Status == "Submitted" || this.state.Status == "TS Added")?
                    <th className="text-center">
                      <img src={require('../assets/plus.png')} className={styles.imgTableIcon}  onClick={this.handleAddRow}/>
                    </th>	
                    :null}
                  </tr>
                {/* </thead>
                <tbody> */}
                  
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
                      <td>
                        <DatePicker  
                            required={true}
                            selected={ this.state.rows[idx].interviewStartDate }  
                            onChange={ this.handleChange(idx,"interviewStartDate") }  
                            minDate={new Date()}
                            maxDate={this.state.rows[idx].interviewEndDate}
                            name="interviewStartDate"  
                            showTimeSelect
                            dateFormat="dd/MM/yyyy hh:mm a"  
                        />  
                        {(!this.state.rows[idx].interviewerValidation.isinterviewStartDate)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                      <td>
                        <DatePicker  
                            required={true}
                            disabled={this.state.rows[idx].Onlyread}
                            selected={ this.state.rows[idx].interviewEndDate }  
                            onChange={ this.handleChange(idx,"interviewEndDate") }  
                            name="interviewEndDate"  
                            minDate={this.state.rows[idx].interviewStartDate}
                            showTimeSelect
                            dateFormat="dd/MM/yyyy hh:mm a"  
                        />  
                          {(!this.state.rows[idx].interviewerValidation.isinterviewEndDate)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                      <td>
                        <select  name="TimeZone"
                              required={true}
                              value={this.state.rows[idx].TimeZone}
                              onChange={this.handleChange(idx,"TimeZone")}
                              className="form-control">
                          {this.state.dropdownoptions.map((newitem) => (<option value={newitem}>{newitem}</option>))}
                        </select>
                        {(!this.state.rows[idx].interviewerValidation.isTimeZone)?<div><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
                      </td>
                      <td>
                         <input
                              type="checkbox"
                              name="CandidateConfirmation"
                              checked={this.state.rows[idx].CandidateConfirmation}
                              onChange={this.handleChange(idx,"CandidateConfirmation")}
                              className="form-control"
                            />
                            
                      </td>
                      {(this.state.Status == "Submitted" || this.state.Status == "TS Added")?
                      <td><img src={require('../assets/cross.png')} className={styles.imgTableIcon}  onClick={this.handleRemoveSpecificRow(idx)}/></td>
                      :null}
                    </tr>
                  ))}
                {/* </tbody> */}
              </table>       
            {/* </div> */}
          {/* </div> */}

          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
          <div className={styles.row} style={{ display: (this.state.coordinator == "" ? 'block' : 'none') }}><span>Please click On Assign to me button to take action on this request</span></div>
          <div className={styles.row} style={{ display: (this.state.coordinator != "" ? 'block' : 'none') }}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>  
            {(this.state.Status == "Submitted" || this.state.Status == "TS Added")?
            // this.updateCandidateDetails("Draft")
            <button type ="button" className={styles.submitButton} name="Draft" onClick={() =>this.DraftCandidateDetails() }>Draft</button>:null}  
            {(this.state.Status == "Submitted" || this.state.Status == "TS Added")?<button className={styles.submitButton} type ="submit" name="Submit" onClick={() =>this.updateCandidateDetails("Submitted")}>Submit</button>:null}
            <button className={styles.submitButton} name="Cancel"onClick={() => this.reload()}>Cancel</button>       
            </div>
          </div>
          </div>
          {/* </form> */}
      </div>
    );
  }
  public async assignCoordinator(): Promise<void> {
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    // let web = new Web(this.props.siteUrl);
    this.state.siteabsoluteurl.currentUser.get().then(async result => {
    let libDetails = await this.state.siteabsoluteurl.lists.getByTitle("Candidate Interview Info");
    libDetails.items.getById(ID).update({
      CoordinatorId:result.Id
  }).then((response) =>{
    let message = "Request is assingned to you!";
    this.isModalOpen(message);
  });
}
);


  
   
  }
}


