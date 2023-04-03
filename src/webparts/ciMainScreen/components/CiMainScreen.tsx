import * as React from 'react';
import styles from './CiMainScreen.module.scss';
import { ICiMainScreenProps } from './ICiMainScreenProps';
import { escape, isEqual } from '@microsoft/sp-lodash-subset';
import pnp, { Web, SearchQuery, SearchResults } from "sp-pnp-js";
import * as $ from 'jquery'; 
import * as JSZip from 'jszip'; 
import 'DataTables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface ICiMainScreenState {  
  Result: any[];  
  activeStatus: string;
  libraries :any[];
  AllStatus:any;
  siteabsoluteaddr: Web;
  todayInterview:Number;
 // siteUrl:any;
}

export default class CiMainScreen extends React.Component<ICiMainScreenProps, ICiMainScreenState> {

  public constructor(props:ICiMainScreenProps,state:ICiMainScreenState){
    super(props);    
    this.state ={      
      Result : [],
      activeStatus : "All",
      libraries :[],
      siteabsoluteaddr:new Web(this.props.siteUrl),
     // siteUrl:this.props.siteUrl
     todayInterview:0,
     AllStatus:{
      All:0,
      Draft:0,
      Submitted:0,
      "TS Added":0,
      "TS Selected":0,
      "TS Approved":0,
      "TS Finalised":0,
      "TS Rejected":0,
      // "SI Accepted 1":0,
      // "SI Accepted 2":0,
      // "SI Accepted":0  
     }
    };   
  }

  public async componentDidMount(){
    this.GetResult();  
    this.getScheduledInterview();  
    $("[class*='ms-OverflowSet ms-CommandBar-primaryCommand primarySet']").first().css( "display", "none" );
    $("[data-automation-id=pageHeader]").hide();
    $('#CommentsWrapper').hide();
    $('.CanvasZone div').eq(0).removeAttr('class'); 
  }
  

  private async getScheduledInterview(){
    let todaysinterview = await this.state.siteabsoluteaddr.lists
      .getByTitle("InterviewerDetails")
      .items.select("ID").filter(`substringof('`+new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit" })+`',InterviewStartDate)`).get();
      //filter("InterviewStartDate gt datetime'"+new Date('Feb 07, 2023, 12:00 AM').toISOString()+"' and InterviewStartDate lt datetime'"+new Date('Feb 07, 2023, 11:59 PM').toISOString()+"'").get(); 
        //("InterviewStartDate gt '"+new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit" })+"', 12:00 AM) and (InterviewStartDate lt '"+new Date().toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit" })+"', 11:59 PM")).get(); 
      //.select("ID","Title","Interviewer")
      //.get();
      this.setState({
        todayInterview: todaysinterview.length
      });
      console.log(todaysinterview );
  }
  //function to filter data based on status
  private async filterStatus(status){
    this.setState({activeStatus:status});
    status = status.trim().toLowerCase();
    let libraries=this.state.Result;
    if(status != "all"){
      libraries = libraries.filter(l => {
        return l.Status.toLowerCase().match(status);
        //l.Status.toLowerCase() == status;
      });
  }
  this.setState({
    libraries:libraries
  });
  console.log(libraries);
  this.mapDatatable(libraries);
  

  }

  private async GetResult() {
    let web = new Web(this.props.siteUrl);
    let libDetails = await web.lists
      .getByTitle("Candidate Interview Info")
      .items.select("*","Author/Title,Coordinator/Title").expand("Author,Coordinator").get(); 
      //.select("ID","Title","Interviewer")
      //.get();
      console.log(libDetails);
      let AllStatus={};
      Object.keys(this.state.AllStatus).forEach(key => {
        let status=key.trim().toLowerCase();
        let count=[];
        
        if(key == "All"){
          //const status = this.state.AllStatus[key]
          count = libDetails;  
        }else{
            count = libDetails.filter(l => {
            return  l.Status.toLowerCase().match(status);
          });
        }
       AllStatus[key]=count.length;
       // console.log(count);
        //console.log(key, status); // "someKey" "some value", "hello" "world", "js javascript foreach object"
      });
      console.log(AllStatus);
      this.setState({
      Result : libDetails,
      libraries : libDetails,
      AllStatus
      });
    //calling  to map data 
    this.mapDatatable(libDetails);
   
  }
//function to map data to datatable
 private mapDatatable(libDetails){
 // let arrayDataTable =new Array();
  let jsonArray = libDetails.map( (item) => {
    let Today = null;
    let SubmittedDate= null;
    let TimeSinceThen ="";
    let Submitted = null;
    
    if(item['Submitted'] != null){
       Today = new Date();
       Submitted  = new Date(item['Submitted'])
      let diffMs = (Today - Submitted);
      let diffDays = Math.floor(diffMs / 86400000); // days
      let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
      let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
      TimeSinceThen=diffDays + " d : " + diffHrs + " h : " + diffMins + " m";
      // Today = new Date().getTime(); 
      // SubmittedDate =new Date(item['Submitted']).getTime();
      // const one_day = 1000*60*60*24;
      // TimeSinceThen=Math.ceil((Today-SubmittedDate)/(one_day));
    }

    // arrayDataTable.push({"Reqest ID" :item['RequisitionID'],  
    // "Title":item['Title'],
    // "Author":item['Author']['Title'],  
    // "Position":item['Position'],
    // "Submitted":item['Submitted'] != null ?new Date(item['Submitted']).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }):"",
    // "Time Since Then":"",
    // "Status":item['Status'],
    // "Comment":item['Comment']

    // })
   
    
    
    
    return [ 
        item.ID,
        item['InterviewID'],
        item['RequisitionID'],
        item['HiringManager'] !=null? item['HiringManager']:"",
        item['Title'],
        item['CoordinatorId'] !=null? item['Coordinator']['Title']:"", 
        item['AdditionalDetails'],
        Submitted=item['Submitted'] != null ?new Date(item['Submitted']).toLocaleString("en-US"):"",
        item['Comment'],
        TimeSinceThen,
        item['Status'],
       
    ];  
  });

  let self = this;
  //create dataTable
  window["JSZip"] = JSZip;
 let table= $('#tblResult').DataTable( {  
    order: [[0, 'desc']],//added sorting of id desc
    destroy: true,  
    data: jsonArray,  
    columns: [  
          //  { title: "Time Since Then" }, 
          
         {title:"Sr no",
         visible:false,
          "render":function (title, type, full, meta) {
          return title;
        } },

          { title: "Interview ID",
            "render": function (title, type, full, meta) {
              let url="";
              if(full[10] == "Draft"){
                 url=  self.props.siteUrl + "/SitePages/New-Request.aspx?Req="+full[0];
              }else if(full[10] == "Submitted" || full[10] == "TS Added"){
                url= self.props.siteUrl + "/SitePages/UpdateTimeSlot.aspx?Req="+full[0];
              }else if(full[10] == "TS Selected" || full[10] == "TS Approved" || full[10] == "TS Finalised" ){
                url= self.props.siteUrl + "/SitePages/Time-Slot.aspx?Req="+full[0];
              }else {

            }
            return '<a target="_blank" href="'+url+'">'+title+'</a>';
          }
          
          }, 
          { title: "Requisition ID"},
          { title: "Hiring Manager"},
          { title: "Candidate Name",
           }, 
           
          { title: "Co-Ordinator",
           className: "Coordinator", 
          },    
          { title: "Candidate ID",
           }, 
          { title: "Submitted" },
          { title: "Status" },//Commnet column
          { title: "Time Since Then",
          "render": function (title, type, full, meta) {
            let day=(title.split("d")[0]).trim()
            if(day > 1){
            return '<div style="color:red">'+title+'</div>'; 
            }
            else{
              return title;
            }
          } 
          
        },         
          { title: "Status",
          visible:false, 
          },
          


      ],
      /*dom: 'Bfrtip',
      buttons: [
        {extend: 'csv'}
    ]  */
  } );

  $("#tblResult thead th").each( function ( i ) {
    if(i==4){
    var select = $('<select><option value=""></option></select>')
        .appendTo( $(this) )
        .on( 'change', function () {
            let val = $(this).val().toString();
            table.column( i+1 )
                .search( val)
                .draw();
        } );

    table.column( i+1 ).data().unique().sort().each( function ( d, j ) {
        select.append( '<option value="'+d+'">'+d+'</option>' );
    } );
  }
} );
  
 }

  private convertUTCDateToLocalDate(date) {
    date = new Date(date +"Z");
    let newdt = date.toLocaleDateString('en-us', { month: 'short', weekday:"short", day:"numeric", hour:'numeric', minute:'numeric', timeZone: 'Asia/Kolkata'});
    return newdt;   
}

  public render(): React.ReactElement<ICiMainScreenProps> {
    SPComponentLoader.loadCss('https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css');
    SPComponentLoader.loadCss('https://cdn.datatables.net/buttons/2.2.3/css/buttons.dataTables.min.css');  

    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <div className={styles.maincontainer}>
        <div className={styles.row}>          
          <div className={styles.columnMain}>            
            <div style={{marginBottom:'3%'}}>
              <span>Todays interviews - {this.state.todayInterview}</span>
              <a href= {this.props.siteUrl + "/SitePages/New-Request.aspx"} type ="button" className={styles.newReq}>Create New Interview Request</a>
            </div>
            <div className={styles.menuSection}>
            <ul className={styles.Menu_Ul}>
            {/* {(this.state.)?<span></span>:null}*/}
              <li>
                <a title='All Requests'
                    className={this.state.activeStatus == "All"?styles.active:""} 
                    href="#All"
                    onClick={() =>this.filterStatus("All")}>
                    
                    <div className={styles.menuHeading}>{this.state.AllStatus["All"]}</div>
                    {/* <span> ({this.state.AllStatus["All"]})</span> */}
                    <div className={styles.menuTitle}>All</div>
                </a>
              </li>
              <li>
                <a title='Draft requests submitted by Recruiter'
                    className={this.state.activeStatus == "Draft"?styles.active:""}
                    href="#DR" 
                    onClick={() =>this.filterStatus("Draft")}>
                    
                    <div className={styles.menuHeading}>{this.state.AllStatus["Draft"]}</div>
                    {/* <span> ({this.state.AllStatus["Draft"]})</span> */}
                    <div className={styles.menuTitle}>Draft</div>
                </a>
              </li>
              <li>
                <a title='New requests submitted by Recruiter'
                    className={this.state.activeStatus == "Submitted"?styles.active:""} 
                    href="#SR" 
                    onClick={() =>this.filterStatus("Submitted")}>
                    
                    <div className={styles.menuHeading}>{this.state.AllStatus["Submitted"]}</div>
                    <div className={styles.menuTitle}>New Request</div>
                    {/* <span> ({this.state.AllStatus["Submitted"]})</span> */}
                </a>
              </li>
              <li>
                <a title='Time slots sent to Candidate'
                    className={this.state.activeStatus == "TS Added"?styles.active:""} 
                    href="#TSA" 
                    onClick={() =>this.filterStatus("TS Added")}>
                   
                    <div className={styles.menuHeading}>{this.state.AllStatus["TS Added"]}</div>
                    <div className={styles.menuTitle}>Time Sent to Candidate</div>
                    {/* <span> ({this.state.AllStatus["TS Added"]})</span> */}
                </a>
              </li>
              <li>
                <a title='Time slots submitted by Candidate'
                    className={this.state.activeStatus == "TS Selected"?styles.active:""} 
                    href="#TSS" 
                    onClick={() =>this.filterStatus("TS Selected")}>
                     
                    <div className={styles.menuHeading}>{this.state.AllStatus["TS Selected"]}</div>
                    <div className={styles.menuTitle}>Candidate provided time</div>
                    {/* <span> ({this.state.AllStatus["TS Selected"]})</span> */}
                </a>
              </li>
              <li>
                <a title='Time slots sent to Interviewers'
                    className={this.state.activeStatus == "TS Approved"?styles.active:""}
                    href="#STS" 
                    onClick={() =>this.filterStatus("TS Approved")}>
                     
                   <div className={styles.menuHeading}>{this.state.AllStatus["TS Approved"]}</div>
                   <div className={styles.menuTitle}>Invite sent to interviewer</div>
                    {/* <span> ({this.state.AllStatus["TS Approved"]})</span> */}
                </a>
              </li>
              <li>
                <a title='Time slots finalized by interviewer'
                    className={this.state.activeStatus == "TS Finalised"?styles.active:""} 
                    href="#TSF" 
                    onClick={() =>this.filterStatus("TS Finalised")}>
                    
                    <div className={styles.menuHeading}>{this.state.AllStatus["TS Finalised"]}</div>
                    <div className={styles.menuTitle}>Interviewer Accepted</div>
                    {/* <span> ({this.state.AllStatus["TS Finalised"]})</span> */}
                </a>
              </li>
              <li>
                <a title='Time slots rejected by interviewers'
                    className={this.state.activeStatus == "TS Rejected"?styles.active:""} 
                    href="#TSR" 
                    onClick={() =>this.filterStatus("TS Rejected")}>
                    
                    <div className={styles.menuHeading}>{this.state.AllStatus["TS Rejected"]}</div>
                    <div className={styles.menuTitle}>Interviewer Decline</div>
                    {/* <span> ({this.state.AllStatus["TS Rejected"]})</span> */}
                </a>
              </li>
              {/* <li>
                <a 
                    className={this.state.activeStatus == "SI Accepted 1"?styles.active:""} 
                    href="#SIA1" 
                    onClick={() =>this.filterStatus("SI Accepted 1")}>
                    SI Accepted 1 
                    {this.state.AllStatus["SI Accepted 1"] !=0 && <span> ({this.state.AllStatus["SI Accepted 1"]})</span>}
                    
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "SI Accepted 2"?styles.active:""} 
                    href="#SIA2" 
                    onClick={() =>this.filterStatus("SI Accepted 2")}>
                    SI Accepted 2 
                    {this.state.AllStatus["SI Accepted 2"] !=0 && <span> ({this.state.AllStatus["SI Accepted 2"]})</span>}
                  
                  </a>
              </li> */}
              {/* <li>
                <a 
                    className={this.state.activeStatus == "SI Accepted"?styles.active:""} 
                    href="#SIA" 
                    onClick={() =>this.filterStatus("SI Accepted")}>
                    SI Accepted 
                    {this.state.AllStatus["SI Accepted"] !=0 && <span> ({this.state.AllStatus["SI Accepted"]})</span>}
                    
                </a>
              </li> */}
            </ul>
            </div>          
            <table id="tblResult" className="display" width="100%">
            </table>
          </div>
        </div>        
      </div>
    );
  }
}
