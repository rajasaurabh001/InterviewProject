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


export interface ICiCandidateScreenState {
  rows: any;
  RequestID:any;
  CandidateName:string;
  CandidateEmail:string;
  AdditionalDetails:string;
  JobTitle:string;
  Position:string;
  JobDetails:string;
  Status:string;
  candiConfChecked:boolean;
  dropdownoptions:any;
  isModalOpen:boolean
}

export default class CiCandidateScreen extends React.Component<ICiCandidateScreenProps, ICiCandidateScreenState> {

  constructor(props:ICiCandidateScreenProps, state:ICiCandidateScreenState) {
    super(props);
    this.state ={
      rows: [],
      RequestID:"",
      CandidateName : "",
      CandidateEmail:"",
      AdditionalDetails:"",
      JobTitle:"",
      Position:"",
      JobDetails:"",
      Status:"",
      candiConfChecked:false,
      dropdownoptions:[],
      isModalOpen:false
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
  }
  // handleCanditeDetails=(e)=>{
  //   const {value} = e.target;
  //   this.setState({
  //     JobDetails : value,
  //   });
  //   console.log(this.state);
  // }
  public handleChange = (idx,elementName) => async (event) => {
    // const { name, value } = event.target;
    let ele =elementName;
    const rows = [...this.state.rows];
    if(elementName=="interviewStartDate"){
      rows[idx].interviewStartDate = event;
      rows[idx].Onlyread = false;
    }else if(elementName=="interviewEndDate"){
      rows[idx].interviewEndDate = event;
    }else if(elementName=="CandidateConfirmation"){
      rows[idx].CandidateConfirmation = event.target.checked;
      if(event.target.checked){
        this.setState({
          candiConfChecked:true
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
      Onlyread:true
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
     })
   
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
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists;
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
   // this.addInterviewDetail();
    
  }
  public getInterviewDetail = async () =>{
    console.log("this is in addInterViewDetails");
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    
      //console.log(el)
      let web = new Web(this.props.siteUrl);
      let libDetails = await web.lists
      .getByTitle("InterviewerDetails")
      .items.select("ID,Title,InterViewerDesignation,InterviewStartDate,CandidateConfirmation,InterviewEndDate,RequestID/ID,InterviewerEmail,TimeZone").expand("RequestID/Title").filter("RequestID eq '" + ID + "'").get().then((results) =>{
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
      ID:element.ID
    };
    this.setState({
      rows: [...this.state.rows, item]
    });
    if(element.CandidateConfirmation == true){
      this.setState({
        candiConfChecked:true
      })
    }
  }
  private async updateCandidateDetails(status){
    console.log(status);
    let submittedStatus = "TS Added"
    let submittedComment = "Waiting for timeslot selection by candidate"
    let Runflow =  false;
    if(this.state.candiConfChecked == true){
      submittedStatus = "TS Approved";
      submittedComment="Waiting for timeslot approval by interviewer";
      Runflow =  true;
    }  
    let Status =(status=="Draft") ?"Draft":submittedStatus;  
    let queryParams = new URLSearchParams(window.location.search);
    let ID = parseInt(queryParams.get("Req")); 
    let web = new Web(this.props.siteUrl);
    let libDetails = await web.lists.getByTitle("Candidate Interview Info");
    if(Status=="TS Approved"){//In Case of  TS Approved
        libDetails.items.getById(ID).update({
          Title: this.state.CandidateName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          Position: this.state.Position,
          JobDetails: this.state.JobDetails,
          Comment:submittedComment,
          Status:Status,
          Runflow :Runflow,
          TimeslotAcceptedDatetime:new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
      });
    }
      else if(Status=="TS Added"){//In Case of  TS ADDED
        libDetails.items.getById(ID).update({
          Title: this.state.CandidateName,
          CandidateEmail: this.state.CandidateEmail,
          AdditionalDetails: this.state.AdditionalDetails,
          JobTitle: this.state.JobTitle,
          Position: this.state.Position,
          JobDetails: this.state.JobDetails,
          Comment:submittedComment,
          Status:Status,
          Runflow :Runflow,
          TimeslotAddedDatetime:new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
      });
        
      }
    else{//In case of draft
      libDetails.items.getById(ID).update({
        Title: this.state.CandidateName,
        CandidateEmail: this.state.CandidateEmail,
        AdditionalDetails: this.state.AdditionalDetails,
        JobTitle: this.state.JobTitle,
        Position: this.state.Position,
        JobDetails: this.state.JobDetails,
    }); 
    }
    await this.addInterviewDetail();
     this.isModalOpen(); 
    // let confirmation=confirm("All Interviewer Details are updated");
    // const myTimeout = setTimeout(this.reload, 2000);

  }

    public addInterviewDetail=async () =>{
      console.log("this is in addInterViewDetails");
      let interviewers=this.state.rows;
      interviewers.forEach(async (el)=>{
        console.log(el);
        let web = new Web(this.props.siteUrl);
        let libDetails = await web.lists.getByTitle("InterviewerDetails");
        if(el.ID == undefined){
          libDetails.items.add({
            Title: el.InterviewerName,
            InterViewerDesignation: el.Designation,
            InterviewerEmail:el.InterviewerEmail,
			      InterviewStartDate: new Date(el.interviewStartDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),
            InterviewEndDate: new Date(el.interviewEndDate).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }),	
            TimeZone:el.TimeZone,
            CandidateConfirmation:el.CandidateConfirmation,										 
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
            TimeZone:el.TimeZone,
            CandidateConfirmation:el.CandidateConfirmation,	
            //RequestIDId:this.state.RequestID
          });
        }
      });    
    }
    public isModalOpen = async() => {
      this.setState({isModalOpen:true});
    }
    public reload =() =>{
      // window.location.reload();
      const myTimeout = setTimeout(window.location.href="https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Dashboard.aspx", 2000);
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
        Status: response.Status
       });
    });
  }
  private async GetTimeZone() {
    let web = new Web(this.props.siteUrl);
    let timezones = await web.lists
      .getByTitle("TimeZone MasterList")
      .items
      //.select("ID","Title","Interviewer")
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
      <div>
        <div className={styles.row}>
            <div className={styles.columnleft}>
            <img src={require('../assets/homeicon.png')} className={styles.homeIcon}  onClick={this.reload}/>           
            </div>
          </div>
         <Modal isOpen={this.state.isModalOpen} isBlocking={false} className={styles.custommodalpopup} >
            <div className='modal-dialog modal-help' style={{width: '500px', height: '170px',}}>
              <div className='modal-content'>
                {/* <div className={styles['modal-header']}>
                  <h3 className='modal-title'></h3>
                </div> */}
                <div className={styles['modal-body']}><span ><h2>All Interviewer Details are updated !</h2></span>
                <div><img src={require('../assets/accept.png')} className={styles.imgcheckIcon}/></div></div>
                <div className={styles['modal-footer']} >
                  <button type="button" className={styles.submitButton} onClick={()=>{this.reload()}} style={{float:'right',margin:'10px' ,width:'65px'}}>OK</button>
                </div>
              </div>
            </div>          
          </Modal>
          <h2>Send Time Slots to Candidates</h2>
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
              <span>Reqest ID</span>                
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
                          type="text"
                          name="InterviewerName"
                          value={this.state.rows[idx].InterviewerName }
                           onChange={this.handleChange(idx,"InterviewerName")}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="InterviewerEmail"
                          value={this.state.rows[idx].InterviewerEmail }
                          onChange={this.handleChange(idx,"InterviewerEmail")}
                          className="form-control"
                        />
                      </td>
                      
                      <td>
                        <input
                          type="text"
                          name="Designation"
                          value={this.state.rows[idx].Designation}
                         onChange={this.handleChange(idx,"Designation")}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <DatePicker  
                            selected={ this.state.rows[idx].interviewStartDate }  
                            onChange={ this.handleChange(idx,"interviewStartDate") }  
                            minDate={new Date()}
                            name="interviewStartDate"  
                            showTimeSelect
                            dateFormat="dd/MM/yyyy hh:mm a"  
                        />  
                      </td>
                      <td>
                        <DatePicker  
                            readOnly={this.state.rows[idx].Onlyread}
                            selected={ this.state.rows[idx].interviewEndDate }  
                            onChange={ this.handleChange(idx,"interviewEndDate") }  
                            name="interviewEndDate"  
                            minDate={this.state.rows[idx].interviewStartDate}
                            showTimeSelect
                            dateFormat="dd/MM/yyyy hh:mm a"  
                        />  
                      </td>
                      <td>
                        <select  name="TimeZone"
                              value={this.state.rows[idx].TimeZone}
                              onChange={this.handleChange(idx,"TimeZone")}
                              className="form-control">
                          {this.state.dropdownoptions.map((newitem) => (<option value={newitem}>{newitem}</option>))}
                        </select>
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
          <div className={styles.row}>
            <div className={styles.columnfull} style={{backgroundColor: "white", marginLeft: '40%'}}>  
            {(this.state.Status == "Submitted" || this.state.Status == "TS Added")?
            <button className={styles.submitButton} name="Draft" onClick={() => this.updateCandidateDetails("Draft")}>Draft</button>:null}  
            {(this.state.Status == "Submitted" || this.state.Status == "TS Added")?<button className={styles.submitButton} name="Submit"onClick={() => this.updateCandidateDetails("Submitted")}>Submit</button>:null}
            <button className={styles.submitButton} name="Cancel"onClick={() => this.reload()}>Cancel</button>       
            </div>
          </div>
      </div>
    );
  }
}


