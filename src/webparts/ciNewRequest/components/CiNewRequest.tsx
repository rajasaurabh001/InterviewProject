import * as React from 'react';
import styles from './CiNewRequest.module.scss';
import { ICiNewRequestProps } from './ICiNewRequestProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, SearchQuery, SearchResults, ItemAddResult } from "sp-pnp-js";
import * as $ from 'jquery'; 
import { Modal, values } from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
export interface ICiNewRequestState {
  //rows: any;
  RequestID:number;
  CandidateFirstName :string;
  CandidateLastName:string;
  CandidateEmail:string;
  AdditionalDetails:string;
  JobTitle:string;
  InterviewerName:string;
  InterviewerEmail:string;
  HiringManager:any;
  Recruiter:number;
  DefaultHiringManager:any;
  RequisitionID:string;
  Status:string;
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
  isInterviewerName:boolean;
  isInterviewerEmail : boolean;
}

export default class CiNewRequest extends React.Component<ICiNewRequestProps, ICiNewRequestState> {
  //update requisiton ID

  constructor(props:ICiNewRequestProps,state:ICiNewRequestState ){
    super(props);
    this.state ={
     // rows: [],
      RequestID:null,
      CandidateFirstName  : "",
      CandidateLastName  : "",
      CandidateEmail:"",
      AdditionalDetails:"",
      JobTitle:"",
      // Position:"",
      RequisitionID:"",
      InterviewerName:"",
      InterviewerEmail:"",
      HiringManager:[],
      Recruiter:null,
      DefaultHiringManager:[],
      Status:"",
      isModalOpen:false,
      isSubmmited:false,
      // validationobject:{ 
        isCandidateFirstName :true,
        isCandidateLastName :true,
        isCandidateEmail:true,
        isAdditionalDetails: true,
        isJobTitle: true,
        isRequisitionID: true,
        isHiringManager:true,
        isInterviewerName:true,
        isInterviewerEmail:true,
      //  },
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
    $("[class*='ms-OverflowSet ms-CommandBar-primaryCommand primarySet']").first().css( "display", "none" );
    $("[data-automation-id=pageHeader]").hide();
    $('#CommentsWrapper').hide();
    // $('.CanvasZone div').eq(0).removeAttr('class');
  }
   public getRequestDetail=async () =>{ 
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
 
    console.log(this.state);
    let web = new Web(this.props.siteUrl);
    let libDetails = await web.lists
    .getByTitle("Candidate Interview Info")
    .items.getById(ID).select("*","HiringManager/Title,HiringManager/EMail").expand("HiringManager").get().then((response) => {
      console.log(response);
      this.setState({
        RequestID: response.ID,
        CandidateFirstName : response.CandidateFirstName ,
        CandidateLastName : response.CandidateLastName, 
        CandidateEmail: response.CandidateEmail,
        AdditionalDetails: response.AdditionalDetails,
        JobTitle: response.JobTitle,
        HiringManager:response.HiringManagerId != null?[...this.state.HiringManager,response.HiringManagerId]:[],
        DefaultHiringManager: response.HiringManagerId != null?[...this.state.DefaultHiringManager,response.HiringManager.EMail]:[],
        RequisitionID: response.RequisitionID,
        InterviewerEmail:response.InterviewerEmail,
        InterviewerName:response.InterviewerName,

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
      //window.location.href="https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Dashboard.aspx";
    });
  }
  private   formValidation = () => {
    let isValidated = true;
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
    if(this.state.InterviewerName == ""){
      isValidated =false;
      this.setState({isInterviewerName :false});
      // $("#val_InterviewerName").css( "display", "block" );
    }
    if(this.state.InterviewerEmail == ""){
      isValidated =false;
      this.setState({isInterviewerEmail :false});
      // $("#val_InterviewerEmail").css( "display", "block" );
    }
    if(this.state.HiringManager.length <=  0){
      isValidated =false;
      this.setState({isHiringManager :false});
      // $("#val_HiringManager").css( "display", "block" );
    }
    return isValidated;
  } 
  //Add new request to the List
  private async addNewRequest(){
    let isValidated = false;
    isValidated = this.formValidation();
    // const allTrue = Object.values(this.state.validationobject).every(
    //   value => value === true
    // );
    // this.setState({
    //   isValidated : allTrue,
    // })
    this.setState({
      isSubmmited : true,
    });
  if(isValidated){
    let queryParams = new URLSearchParams(window.location.search);
    const ID = parseInt(queryParams.get("Req")); 
    let SubmittedDatetime  =new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
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
          InterviewerEmail:this.state.InterviewerEmail,
          InterviewerName:this.state.InterviewerName,
          HiringManagerId: this.state.HiringManager[0],
          RecruiterId:this.state.Recruiter,
          RunProcess:true,
          Comment:"Waiting for timeslot entry",
          Status:"Submitted",
          Submitted:SubmittedDatetime
      }).then(async (response: ItemAddResult) => {
       
        await this.addInterviewDetail(response.data);
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
          InterviewerEmail:this.state.InterviewerEmail,
          InterviewerName:this.state.InterviewerName,
          HiringManagerId: this.state.HiringManager[0],
          RecruiterId:this.state.Recruiter,
          RunProcess:true,
          Comment: "Waiting for timeslot entry",
          Status:"Submitted",
          Submitted:SubmittedDatetime
      });
      await this.isModalOpen(this.state.Submittedmessage);   
    }
  }
  }

  private async addDraftRequest(){
    let queryParams = new URLSearchParams(window.location.search);
    const ID = parseInt(queryParams.get("Req")); 
    
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
          HiringManagerId: this.state.HiringManager[0],
          RecruiterId:this.state.Recruiter,
          InterviewerEmail:this.state.InterviewerEmail,
          InterviewerName:this.state.InterviewerName,
          Comment:"Request has been created by " + this.props.userDisplayName,
          Status:"Draft",
      }).then(async (response: ItemAddResult) => {
        // alert("added")
        this.setState({
          RequestID: response.data.ID
         });
        
        await this.addInterviewDetail(response.data);
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
          InterviewerEmail:this.state.InterviewerEmail,
          InterviewerName:this.state.InterviewerName,
          RequisitionID: this.state.RequisitionID,
          HiringManagerId: this.state.HiringManager[0] ,
          RecruiterId:this.state.Recruiter,
      });
        await this.isModalOpen(this.state.Draftmessage); 
        //await this.addInterviewDetail(response.data);  
    }
  }

  public addInterviewDetail= async (data) =>{
    console.log("this is in addInterViewDetails");
      let web = new Web(this.props.siteUrl);
      let libDetails = web.lists.getByTitle("InterviewerDetails");
        libDetails.items.add({
          Title: this.state.InterviewerName,
          InterviewerEmail:this.state.InterviewerEmail,										 
          RequestIDId:data.ID
        }).then(async (response: ItemAddResult) => {
          console.log(response);
        });
      //}
      }
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
  public handleChange = () => async(event) => {
    
      const { name, value } = event.target;
      //const rowInfo = rows[idx];
      //rowInfo[name] = value;
    
  }

  public isModalOpen = async(message:any) => {
    this.setState({
      isModalOpen:true,
      modalmessage:message,
    });
  }
  public reload =() =>{
    // window.location.reload();
    const myTimeout = setTimeout(window.location.href=this.props.siteUrl+"/SitePages/Dashboard.aspx", 2000);
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
                {/* <div className={styles['modal-header']}>
                  <h3 className='modal-title'></h3>
                </div> */}
                <div className={styles['modal-body']}><span ><h2 className='modalmessage'>{this.state.modalmessage}</h2></span>
                <div><img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/></div></div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{this.reload();}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
                </div>
              </div>
            </div>          
          </Modal>
                

          {/* <form action="" onSubmit={() =>this.addNewRequest()}> */}
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
             {/* id="val_CandidateFirstName"  */}
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
              <span>Position Details</span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Job Title</span>                
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
          {/* <div className={styles.row}>
            <div className={styles.columnleft}>
              <span>Position</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({Position : e.target.value});}} value={this.state.Position}/>                          
            </div>
          </div> */}
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Requisition ID</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" 
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
              <span>Interviewer Details</span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Interveiwer Name</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" 
                required={true}
                name="InterviewerName" 
                className={styles.inputtext} 
                onChange={(e)=>{
                  this.setState({
                    InterviewerName: e.target.value,
                    // validationobject: {
                      isInterviewerName:(e.target.value) != "" ?true:false
                    // }
                  });
                }}   
              value={this.state.InterviewerName}/>  
             {/* <div className={styles.row}><span className={styles.requiredfield} id="val_InterviewerName">Field can not be blank!</span></div> */}
             {(!this.state.isInterviewerName)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null} 
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Interveiwer Email</span>                
            </div>
            <div className={styles.columnright}>    
            <input type="text" 
                required={true}
                name="InterviewerEmail" 
                className={styles.inputtext} 
                onChange={(e)=>{
                  this.setState({
                    InterviewerEmail: e.target.value,
                    // validationobject: {
                      isInterviewerEmail:(e.target.value) != "" ?true:false
                    // }
                  });
                }}   
              value={this.state.InterviewerEmail}/>  
             {/* <div className={styles.row}><span className={styles.requiredfield} id="val_InterviewerEmail">Field can not be blank!</span></div> */}
             {(!this.state.isInterviewerEmail)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null}
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
                onChange={this._getPeoplePickerItems
                }
                defaultSelectedUsers={this.state.DefaultHiringManager}
                showHiddenInUI={false}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000} 
                ensureUser={true}
              />
            {/* <div className={styles.row}><span className={styles.requiredfield} id="val_HiringManager">Field can not be blank!</span></div> */}
            {(!this.state.isHiringManager)?<div className={styles.row}><span className={styles.requiredfield} >Field can not be blank!</span></div>:null} 
            </div>
          </div>
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
           {/* </form> */}
        </div> 
      
    );
  }
}
