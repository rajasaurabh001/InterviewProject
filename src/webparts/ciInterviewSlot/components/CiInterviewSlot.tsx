import * as React from 'react';
import styles from './CiInterviewSlot.module.scss';
import { ICiInterviewSlotProps } from './ICiInterviewSlotProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ItemAddResult, Web } from 'sp-pnp-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from 'office-ui-fabric-react';
// import { IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';
// import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
export interface ICiInterviewSlotState {
  rows: any;
  newrows:any; //new interviewer
  RequestID:any;
  CandidateName:string;
  CandidateEmail:string;
  AdditionalDetails:string;
  JobTitle:string;
  Position:string;
  JobDetails:string;
  maxsequence:any;
  checkboxvalidation:boolean,
  candiConfChecked:boolean;
  RequestStatus:string;
  dropdownoptions:any;
  isModalOpen:boolean;
  modalmessage:String;
  accepticon:boolean;
}

export default class CiInterviewSlot extends React.Component<ICiInterviewSlotProps, ICiInterviewSlotState> {

  constructor(props:ICiInterviewSlotProps, state:ICiInterviewSlotState) {
    super(props);
    this.state ={
      rows: [],
      newrows: [], //new interviewer
      RequestID:"",
      CandidateName : "",
      CandidateEmail:"",
      AdditionalDetails:"",
      JobTitle:"",
      Position:"",
      JobDetails:"",
      maxsequence:1,
      checkboxvalidation:false,
      candiConfChecked:false,
      RequestStatus:"",
      dropdownoptions:[],
      isModalOpen:false,
      modalmessage:"",
      accepticon:true,
    };
  }
public handleChange = (idx,elementName) => async(event) => {
    let ele =elementName;
    const rows = [...this.state.rows];
    if(elementName=="interviewStartDate"){
      rows[idx].interviewStartDate = event;
    }else if(elementName=="interviewEndDate"){
      rows[idx].interviewEndDate = event;
    }else if(elementName=="InterviewerAvailability"){
      rows[idx].InterviewerAvailability = event.target.checked;
    }else if(elementName=="CandidateConfirmation"){
      rows[idx].CandidateConfirmation = event.target.checked;
      if(event.target.checked){
        this.setState({
          candiConfChecked:true,
        })
      }else{
        this.setState({
          candiConfChecked:false
        })
      }
    }
    else{
      const { name, value } = event.target;
      const rowInfo = rows[idx];
      rowInfo[name] = value;
    }
    this.setState({
      rows
    });
    if(rows[idx].CandidateConfirmation==true){
      await this.toggleCheckbox(false,idx);
    }
  }

  public handlenewRowChange =(idx,elementName) => async(event) => {
    let ele =elementName;
    const newrows = [...this.state.newrows];
    if(elementName=="interviewStartDate"){
      newrows[idx].interviewStartDate = event;
      newrows[idx].Onlyread = false;

    }else if(elementName=="interviewEndDate"){
      newrows[idx].interviewEndDate = event;
    }else if(elementName=="CandidateConfirmation"){
      newrows[idx].CandidateConfirmation = event.target.checked;
      if(event.target.checked){
        this.setState({
          candiConfChecked:true,
        })  
      }else{
        this.setState({
          candiConfChecked:false
        })
      }
    }
    else{
      const { name, value } = event.target;
      const rowInfo = newrows[idx];
      rowInfo[name] = value;
    }
    this.setState({
      newrows
    });
    if(newrows[idx].CandidateConfirmation==true){
      await this.toggleCheckbox(true,idx);
    }
  }


  public handleAddRow = () => {
    const item = {
      InterviewerName: "",
      Designation: "",
      InterviewerEmail:"",
      interviewStartDate: null,//new Date(), 
      interviewEndDate: null,//new Date(),
      TimeZone:"",
      CandidateConfirmation:false,
      Onlyread:true
    };
    this.setState({
      newrows: [...this.state.newrows, item],
    });
  }
public toggleCheckbox = async (Isnew: any,idx: any) =>{
  let rows= this.state.rows;
  let newrows=this.state.newrows;
  if(Isnew){
  rows.forEach((el) =>{
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
  rows.forEach((element ,index)=>{
    if(index==idx){
      element.CandidateConfirmation=true;
    }else{ 
      element.CandidateConfirmation=false;
    }
   
  });
}
 this.setState({
  newrows,
  rows
 })
}
  //need to understand
  public handleRemoveSpecificRow = (idx) => () => {
    
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

  public async componentDidMount(){
    this.getRequestDetail();
    this.getInterviewDetail();
    this.GetTimeZone();
    // this.setState({
    //   isModalOpen:true
    // })
    
  }
  public getInterviewDetail = async () =>{
    console.log("this is in addInterViewDetails");
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    
      //console.log(el)
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists
      .getByTitle("InterviewerDetails")
      .items.select("ID,Title,InterViewerDesignation,InterviewStartDate,InterviewEndDate,CandidateConfirmation,SelectedByCandidate,InterviewerAvailability,AddInterviewerSeq,RequestID/ID,InterviewerEmail,TimeZone").expand("RequestID/Title").filter("RequestID eq '" + ID + "'").get().then((results) =>{
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
      SelectedByCandidate:(element.SelectedByCandidate !=null)?element.SelectedByCandidate:"False",
      InterviewerAvailability:(element.InterviewerAvailability !=null)?element.InterviewerAvailability:false,
      AddInterviewerSeq:(element.AddInterviewerSeq!=null)?element.AddInterviewerSeq:null,
      CandidateConfirmation:(element.CandidateConfirmation !=null)?element.CandidateConfirmation:false,
      ID:element.ID
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
    if(element.CandidateConfirmation == true){
      this.setState({
        candiConfChecked:true
      })
    }

    this.setState({
      rows: [...this.state.rows, item]
    });
  }
   private async updateCandidateDetails(status){
    console.log(status); 
    let submittedStatus = "TS Approved"
    let submittedComment = "Waiting for timeslot approval by interviewer"
    let Runflow = (status=="Submitted") ?false: true;
    
    // if(this.state.candiConfChecked == true){
    //   submittedStatus = "TS Finalised";
    //   submittedComment="TS Finalised - Interview Scheduled"
    // } 
    let Status =(status=="Submitted" && !this.state.candiConfChecked) ?"TS Added": submittedStatus;  
    let Comment =(status=="Submitted" && !this.state.candiConfChecked) ?"Waiting for timeslot selection by candidate":submittedComment; 
    if(Status == "TS Approved" &&  this.state.candiConfChecked){
          let queryParams = new URLSearchParams(window.location.search);
          let ID = parseInt(queryParams.get("Req")); 
          let web = new Web(this.props.siteUrl);
          let libDetails = await web.lists.getByTitle("Candidate Interview Info")
              .items.getById(ID).update({
                Title: this.state.CandidateName,
                CandidateEmail: this.state.CandidateEmail,
                AdditionalDetails: this.state.AdditionalDetails,
                JobTitle: this.state.JobTitle,
                Position: this.state.Position,
                JobDetails: this.state.JobDetails,
                Comment: Comment,
                Status:Status,
                Runflow:Runflow 
            });
          
            let addInterviewDetail = await this.addInterviewDetail();
                let newInterviewers=this.state.newrows;
                if(newInterviewers.length > 0){
                    await this.addNewInterviewer();
                  }
                  await this.isModalOpen(" All Interviewer Details are updated !",true); 
    }else{
      await this.isModalOpen("Please give your confirmation before approve !",false);
    }
            // let confirmation=confirm("All Interviewer Details are updated");
            //  const myTimeout = setTimeout(this.reload, 2000);
            
  }
    public reload = async () =>{

      const myTimeout = setTimeout(window.location.href="https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Dashboard.aspx", 2000);

    }

    
   public addInterviewDetail= async() =>{
      console.log("this is in addInterViewDetails");
      let newInterviewers=this.state.newrows;
      console.log(newInterviewers.length);	
      let interviewers=this.state.rows;
      for (let index = 0; index < interviewers.length; index++) {
        let el = interviewers[index];
        console.log(el);
        let web = new Web(this.props.siteUrl);
        let libDetails = await web.lists.getByTitle("InterviewerDetails")
        .items.getById(el.ID).update({
            InterviewerAvailability:el.InterviewerAvailability,	
            CandidateConfirmation:el.CandidateConfirmation,									 
          });
        
      }
     
    }

    public addNewInterviewer=async() =>{
      console.log("NEW INTERVIEWER DETAIL");
      let newInterviewers=this.state.newrows;
      newInterviewers.forEach(async (el)=>{
        console.log(el);
        let web = new Web(this.props.siteUrl);
        let libDetails = await web.lists.getByTitle("InterviewerDetails")
        .items.add({
            Title: el.InterviewerName,
            InterViewerDesignation: el.Designation,
            InterviewerEmail:el.InterviewerEmail,
			      InterviewStartDate: new Date(el.interviewStartDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            InterviewEndDate: new Date(el.interviewEndDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            TimeZone:el.TimeZone,
            AddInterviewerSeq: this.state.maxsequence + 1,		
            CandidateConfirmation:el.CandidateConfirmation,											 
            RequestIDId:this.state.RequestID
          })
      });   
    }
    public async getRequestDetail(){
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    console.log(this.state); 
    let web = new Web(this.props.siteUrl);
    let libDetails = await web.lists
    .getByTitle("Candidate Interview Info")
    .items.getById(ID).get().then((response) => {
      console.log(response);
       this.setState({
        RequestID: response.ID,
        CandidateName: response.Title,
        CandidateEmail: response.CandidateEmail,
        AdditionalDetails: response.AdditionalDetails,
        JobTitle: response.JobTitle,
        Position: response.Position,
        JobDetails: response.JobDetails,
        RequestStatus: response.Status
       });
    });
  }
  private async GetTimeZone() {
    let web = new Web(this.props.siteUrl);
    let timezones = await web.lists
      .getByTitle("TimeZone MasterList")
      .items
      .get();
      console.log(timezones);
      let dropdownoptions=[]
      timezones.forEach(key => {
        dropdownoptions.push(key.Title)
       });
    
      this.setState({
        dropdownoptions 
      });
   
  }
  public isModalOpen = async(message:any,accept:boolean) => {
    
    this.setState({
      isModalOpen:true,
      modalmessage:message,
      accepticon:accept,
    });
  }
  public isModalClose = async() => {
      this.setState({isModalOpen:false});
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
        <div>
         
          <Modal isOpen={this.state.isModalOpen} isBlocking={false} className={styles.custommodalpopup} >
            <div className='modal-dialog modal-help' style={{width: '520px', height: '170px',}}>
              <div className='modal-content'>
                {/* <div className={styles['modal-header']}>
                  <h3 className='modal-title'></h3>
                All Interviewer Details are updated ! </div> */}
                  <div className={styles['modal-body']}><span ><h2 className='modalmessage'>{this.state.modalmessage}</h2></span>
                    <div>
                      {this.state.accepticon ? <img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/>:<img src={require('../assets/cancel.png')} className={styles.imgcheckIcon}/>}
                    </div>
                  </div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{ this.reload()}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
                </div>
              </div>
            </div>          
          </Modal>
          <h2>Interview Time Slots</h2>
          <div className={styles.row}>
            <div className={styles.columnfull}>
              <span>Candidate Details</span>               
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span>Name</span>                
            </div>
            <div className={styles.columnright}>
              <input type="text" className={styles.inputtext}  onChange={(e)=>{this.setState({CandidateName : e.target.value});}}  value={this.state.CandidateName}/>                
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span>Email</span>                
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
              <span>Job Title</span>                
            </div>
            <div className={styles.columnright}>  
              <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({JobTitle : e.target.value});}} value={this.state.JobTitle}/>                
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span>Position</span>                
            </div>
            <div className={styles.columnright}>    
              <input type="text" className={styles.inputtext} onChange={(e)=>{this.setState({Position : e.target.value});}} value={this.state.Position}/>              
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnleft}>
              <span>Requisition ID</span>                
            </div>
            <div className={styles.columnright}>    
              <input type="text" name="JobDetails" className={styles.inputtext} onChange={(e)=>{this.setState({JobDetails : e.target.value});}} value={this.state.JobDetails}/>              
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
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
              <table className={styles.interviewers}>
                  {/* <thead> */}
                    <tr>
                      <th className="text-center"> Interviewer Name </th>
                      <th className="text-center"> Email</th>
                      <th className="text-center"> Designation </th>
                      <th className="text-center"> Start Date & Time </th>
                      <th className="text-center"> End Date & Time </th>
                      <th className="text-center"> TimeZone </th>
                      <th className="text-center">Candidate Available</th>	
                      <th className="text-center">Time slot to submit</th>
                      <th className="text-center"> Candidate Confirmation </th>
                    </tr>
                  {/* </thead>
                  <tbody> */}
                    
                    {this.state.rows.map((item, idx) => (
                      <tr id="addr0" key={idx}>
                        <td>
                          <input
                            readOnly
                            type="text"
                            name="InterviewerName"
                            value={this.state.rows[idx].InterviewerName }
                            onChange={this.handleChange(idx,"InterviewerName")}
                            className="form-control"
                          />
                        </td>
                        <td>
                        <input
                          readOnly
                          type="text"
                          name="InterviewerEmail"
                          value={this.state.rows[idx].InterviewerEmail }
                          onChange={this.handleChange(idx,"InterviewerEmail")}
                          className="form-control"
                        />
                      </td>
                        <td>
                          <input
                            readOnly
                            type="text"
                            name="Designation"
                            value={this.state.rows[idx].Designation}
                            onChange={this.handleChange(idx,"Designation")}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <DatePicker  
                              readOnly
                              selected={ this.state.rows[idx].interviewStartDate }  
                              onChange={ this.handleChange(idx,"interviewStartDate") } 
                              name="interviewStartDate"  
                              showTimeSelect
                              dateFormat="MM/dd/yyyy hh:mm a"  
                          />  
                        </td>
                        <td>
                          <DatePicker  
                              readOnly
                              selected={ this.state.rows[idx].interviewEndDate }  
                              onChange={ this.handleChange(idx,"interviewEndDate") }  
                              name="interviewEndDate" 
                              showTimeSelect
                              dateFormat="MM/dd/yyyy hh:mm a"  
                          />  
                        </td>
                        <td>
                        <select  name="TimeZone" 
                              disabled={true}
                              value={this.state.rows[idx].TimeZone}
                              onChange={this.handleChange(idx,"TimeZone")}
                              className={styles.disabledSelectbox}>
                          {this.state.dropdownoptions.map((newitem) => (<option value={newitem}>{newitem}</option>))}
                          </select>
                        </td>
                        <td> 
                        <div className={this.state.rows[idx].SelectedByCandidate == "True"?styles.Available:styles.notAvailable}></div>
                        </td>
                        <td>
                          {this.state.maxsequence==this.state.rows[idx].AddInterviewerSeq?<input
                              type="checkbox"
                              name="InterviewerAvailability"
                              checked={this.state.rows[idx].InterviewerAvailability}
                              onChange={this.handleChange(idx,"InterviewerAvailability")}
                              className="form-control"
                            />:null}
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
                      </tr>
                    ))}
                  {/* </tbody> */}
              </table>  
            {/* </div> */}
          {/* </div> */}
          {/* {( this.state.RequestStatus != "TS Finalised")? */}
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>  
             {(this.state.newrows.length == 0)?<button className={styles.submitButton} name="AddMore" onClick={this.handleAddRow}>Add More</button>:null }
             {(this.state.newrows.length == 0)?<button className={styles.submitButton} name="Submit" onClick={() => this.updateCandidateDetails("Approved")}>Approve</button>:null}                                   
            </div>
          </div>
          {/* :null} */}
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>
           {(this.state.newrows.length > 0)?
              // <div className={styles.row}>
              //   <div className={styles.columnfull}>
                  <table
                    className={styles.interviewers}
                  >
                     {/* <thead className='newInterviewerthead'> */}
                        <tr>
                          <th className="text-center"> Interviewer Name </th>
                          <th className="text-center"> Email</th>
                          <th className="text-center"> Designation </th>
                          <th className="text-center"> Start Date & Time </th>
                          <th className="text-center"> End Date & Time </th>
                          <th className="text-center"> TimeZone </th>
                          <th className="text-center"> Candidate Confirmation </th>
                          <th className="text-center"><img src={require('../assets/plus.png')} className={styles.imgTableIcon}  onClick={this.handleAddRow}/></th>	
                        </tr>
                      {/* </thead>  */}
                    {/* <tbody>  */}
                      {this.state.newrows.map((item, idx) => (
                        <tr id="addr0" key={idx}>
                          <td>
                            <input
                              type="text"
                              name="InterviewerName"
                              value={this.state.newrows[idx].InterviewerName }
                              onChange={this.handlenewRowChange(idx,"InterviewerName")}
                              className="form-control"
                            />
                          </td>
                          <td>
                        <input
                          type="text"
                          name="InterviewerEmail"
                          value={this.state.newrows[idx].InterviewerEmail }
                          onChange={this.handlenewRowChange(idx,"InterviewerEmail")}
                          className="form-control"
                        />
                      </td>
                          <td>
                            <input
                            
                              type="text"
                              name="Designation"
                              value={this.state.newrows[idx].Designation}
                              onChange={this.handlenewRowChange(idx,"Designation")}
                              className="form-control"
                            />
                          </td>
                          <td>
                            <DatePicker  
                              
                                selected={ this.state.newrows[idx].interviewStartDate }  
                                onChange={ this.handlenewRowChange(idx,"interviewStartDate") }
                                minDate={new Date()}
                                name="interviewStartDate"  
                                showTimeSelect
                                dateFormat="MM/dd/yyyy hh:mm a"  
                            />  
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
                          </td>
                          <td>
                        <select  name="TimeZone"
                              value={this.state.newrows[idx].TimeZone}
                              onChange={this.handlenewRowChange(idx,"TimeZone")}
                              className="form-control">
                          {this.state.dropdownoptions.map((newitem) => (<option value={newitem}>{newitem}</option>))}
                          </select>
                        </td>
                          <td>
                         <input
                             // disabled={this.state.candiConfChecked}
                              type="checkbox"
                              name="CandidateConfirmation"
                              checked={this.state.newrows[idx].CandidateConfirmation}
                              onChange={this.handlenewRowChange(idx,"CandidateConfirmation")}
                              className="form-control"
                            />
                      </td>
                          <td><img src={require('../assets/cross.png')} className={styles.imgTableIcon}  onClick={this.handleRemoveSpecificRow(idx)}/></td>
                        </tr>
                      ))}
                    {/* </tbody> */}
                  </table>              
              //   </div>
              // </div>
            :null}

          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white"}}>                          
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>   
             {(this.state.newrows.length > 0)? <button className={styles.submitButton} name="Submit"onClick={() => this.updateCandidateDetails("Submitted")}>Submit</button>:null}
            </div>
          </div>
        </div>
    );
  }
}