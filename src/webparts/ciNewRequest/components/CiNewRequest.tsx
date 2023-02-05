import * as React from 'react';
import styles from './CiNewRequest.module.scss';
import { ICiNewRequestProps } from './ICiNewRequestProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, SearchQuery, SearchResults, ItemAddResult } from "sp-pnp-js";
import * as $ from 'jquery'; 
import { Modal, values } from 'office-ui-fabric-react';


export interface ICiNewRequestState {
  //rows: any;
 // RequestID:any;
  CandidateName:string;
  CandidateEmail:string;
  AdditionalDetails:string;
  JobTitle:string;
  Position:string;
  JobDetails:string;
  Status:string;
  isModalOpen:boolean;
  validationobject:any;
  isSubmmited:boolean;
  isValidated:boolean;
  modalmessage:String;
  Draftmessage:String;
  Submittedmessage:String;
}

export default class CiNewRequest extends React.Component<ICiNewRequestProps, ICiNewRequestState> {
  //update requisiton ID

  constructor(props:ICiNewRequestProps,state:ICiNewRequestState ){
    super(props);
    this.state ={
     // rows: [],
     // RequestID:"",
      CandidateName : "",
      CandidateEmail:"",
      AdditionalDetails:"",
      JobTitle:"",
      Position:"",
      JobDetails:"",
      Status:"",
      isModalOpen:false,
      isSubmmited:false,
      validationobject:{ CandidateName:true,
        CandidateEmail:false,
        AdditionalDetails: false,
        JobTitle: false,
        Position:false,
        JobDetails: false,
       },
      isValidated:false ,
      modalmessage:"",
      Draftmessage:"This candidate has been added as draft.",
      Submittedmessage:"This request has been submitted to the team."

    };
    
  }
  public async componentDidMount(){
    this.getRequestDetail();
  }
   public getRequestDetail=async () =>{ 
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
 
    console.log(this.state);
    let web = new Web(this.props.siteUrl);
    let libDetails = await web.lists
    .getByTitle("Candidate Interview Info")
    .items.getById(ID).get().then((response) => {
      console.log(response);
      this.setState({
        //RequestID: response.ID,
        CandidateName: response.Title,
        CandidateEmail: response.CandidateEmail,
        AdditionalDetails: response.AdditionalDetails,
        JobTitle: response.JobTitle,
        Position: response.Position,
        JobDetails: response.JobDetails,
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
      RequisitionID: "REQ_"+updatedid,
    }).then((response: ItemAddResult) => {
      let message = (this.state.isSubmmited)?this.state.Submittedmessage:this.state.Draftmessage
      this.isModalOpen(message); 
      //window.location.href="https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Dashboard.aspx";
    });
  }
  //Add new request to the List
  private async addNewRequest(status){
    let isSubmmited =(status=="Draft") ?false:true; 
    if(isSubmmited){
    this.setState({isSubmmited:isSubmmited
    });
    // Object.entries(this.state.validationobject).forEach(key => {
    // console.log(key)
    // });
    const allTrue = Object.values(this.state.validationobject).every(
      value => value === true
    );
    this.setState({
      isValidated : allTrue,
    })
    
    }
  // if(this.state.isValidated){
    let queryParams = new URLSearchParams(window.location.search);
    const ID = parseInt(queryParams.get("Req")); 
    let Status =(status=="Draft") ?"Draft":"Submitted";  
    let SubmittedDatetime =(status=="Submitted") ?new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }):null; 
    let web = new Web(this.props.siteUrl);
    let libDetails = await web.lists.getByTitle("Candidate Interview Info").items;
  
    if(Number.isNaN(ID)){
        libDetails.add({
          Title: this.state.CandidateName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          // Position: this.state.Position,
          JobDetails: this.state.JobDetails,
          Comment:"Request has been created by " + this.props.userDisplayName,
          Status:Status,
          Submitted:SubmittedDatetime
      }).then((response: ItemAddResult) => {
        this.updateRequisitionID(response.data.ID);
      }); 
    }else{
      libDetails.getById(ID).update({
          Title: this.state.CandidateName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          // Position: this.state.Position,
          JobDetails: this.state.JobDetails,
          Comment: "Waiting for timeslot entry",
          Status:Status,
          Submitted:SubmittedDatetime
      }).then((response: ItemAddResult) => {
        
        let message = (this.state.isSubmmited)?this.state.Submittedmessage:this.state.Draftmessage
        this.isModalOpen(message); 
        //console.log(response);
       // window.location.href="https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Dashboard.aspx";
      }); 
    }
  //}
  }
  public isModalOpen = async(message:any) => {
    this.setState({
      isModalOpen:true,
      modalmessage:message,
    });
  }
  public reload =() =>{
    // window.location.reload();
    const myTimeout = setTimeout(window.location.href="https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Dashboard.aspx", 2000);
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
        <div>
          <Modal isOpen={this.state.isModalOpen} isBlocking={false} className={styles.custommodalpopup} >
            <div className='modal-dialog modal-help' style={{width: '500px', height: '170px',}}>
              <div className='modal-content'>
                {/* <div className={styles['modal-header']}>
                  <h3 className='modal-title'></h3>
                </div> */}
                <div className={styles['modal-body']}><span ><h2 className='modalmessage'>{this.state.modalmessage}</h2></span>
                <div><img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/></div></div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{this.reload()}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
                </div>
              </div>
            </div>          
          </Modal>
          <h2>Create New Interview Request</h2>
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span>Candidate Details</span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Name</span>               
            </div>
            <div className={styles.columnright}>
            <input type="text" className={styles.inputtext}  
              onChange={(e)=>{
                this.setState({CandidateName : e.target.value,
                              validationobject:{CandidateName: (e.target.value.length > 0) ? true:false}
                });
              }} 
             value={this.state.CandidateName}/>  
             {this.state.validationobject.CandidateName == false?<div className={styles.row}><span className={styles.requiredfield}>Require field can be blank!</span></div>:null}              
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span><span className={styles.requiredfield}>* </span>Email</span>                
            </div>
            <div className={styles.columnright}>   
            <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({CandidateEmail : e.target.value});}}  value={this.state.CandidateEmail}/>              
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span>Candidate ID</span>                
            </div>
            <div className={styles.columnright}>      
            <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({AdditionalDetails : e.target.value});}} value={this.state.AdditionalDetails}/>            
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
            <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({JobTitle : e.target.value});}} value={this.state.JobTitle}/>                              
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
            <input type="text" name="JobDetails" className={styles.inputtext} onChange={(e)=>{this.setState({JobDetails : e.target.value});}} value={this.state.JobDetails}/>              
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>

          {(this.state.Status == "Draft" || this.state.Status == "")?
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>   
            <button className={styles.submitButton} onClick = {() =>this.addNewRequest("Draft")}>Draft</button>  
            <button className={styles.submitButton} onClick={() =>this.addNewRequest("Submitted")}>Submit</button>           
            </div>
          </div>
           :null}
        </div> 
      
    );
  }
}
