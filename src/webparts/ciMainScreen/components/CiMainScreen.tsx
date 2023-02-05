import * as React from 'react';
import styles from './CiMainScreen.module.scss';
import { ICiMainScreenProps } from './ICiMainScreenProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Web, SearchQuery, SearchResults } from "sp-pnp-js";
import * as $ from 'jquery'; 
import * as JSZip from 'jszip'; 
import 'DataTables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5';
import { SPComponentLoader } from '@microsoft/sp-loader';

export interface ICiMainScreenState {  
  Result: any[];  
  activeStatus: string;
  libraries :any[];
  AllStatus:any;
 // siteUrl:any;
}

export default class CiMainScreen extends React.Component<ICiMainScreenProps, ICiMainScreenState> {

  public constructor(props:ICiMainScreenProps,state:ICiMainScreenState){
    super(props);    
    this.state ={      
      Result : [],
      activeStatus : "All",
      libraries :[],
     // siteUrl:this.props.siteUrl
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
      .items.select("Title,ID,RequisitionID,Position,Status,Comment,Submitted,Author/Title").expand("Author").get(); 
      //.select("ID","Title","Interviewer")
      //.get();
      console.log(libDetails);
      let AllStatus={}
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
       AllStatus[key]=count.length
       // console.log(count);
        //console.log(key, status); // "someKey" "some value", "hello" "world", "js javascript foreach object"
      });
      console.log(AllStatus)
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
    let Today = null
    let SubmittedDate= null
    let TimeSinceThen = 0
    let Submitted = null
    
    if(item['Submitted'] != null){
      Today = (new Date()).valueOf(); 
      SubmittedDate =new Date(item['Submitted']).valueOf()
      const one_day = 1000*60*60*24;
      TimeSinceThen=Math.ceil((Today-SubmittedDate)/(one_day))-1
      
      // let diff=Math.ceil((Today-SubmittedDate)/(one_day))
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
        
        item['RequisitionID'],
        item['Title'],
        item['Author']['Title'],  
        item['Position'],
        Submitted=item['Submitted'] != null ?new Date(item['Submitted']).toLocaleString("en-US", { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }):"",
        TimeSinceThen,
        item['Status'],
        item['Comment']
    ];  
  });

  //create dataTable
  window["JSZip"] = JSZip;
  $('#tblResult').DataTable( {  
    order: [[0, 'desc']],//added sorting of id desc
    destroy: true,  
    data: jsonArray,  
    columns: [  
          //  { title: "Time Since Then" }, 
          
         {title:"Sr no",
          "render":function (title, type, full, meta) {
          return title
        } },
          { title: "Reqest ID",
            "render": function (title, type, full, meta) {
              let url="";
              if(full[7] == "Draft"){
                 url=  "https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/New-Request.aspx?Req="+full[0];
              }else if(full[7] == "Submitted" || full[7] == "TS Added"){
                url= "https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/UpdateTimeSlot.aspx?Req="+full[0];
              }else if(full[7] == "TS Selected" || full[7] == "TS Approved" || full[7] == "TS Finalised" ){
                url= "https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/Time-Slot.aspx?Req="+full[0];
              }else {

            }
            return '<a target="_blank" href="'+url+'">'+title+'</a>';
          }
          }, 
          { title: "Title" }, 
          { title: "Co-Ordinator",},  
          { title: "Position" },
          { title: "Submitted" },
          { title: "Time Since Then",
          "render": function (title, type, full, meta) {
            if(title > 0){
            return '<div>'+title+'</div>'; 
            }
            else{
              return title
            }
          } 
          
        },         
          { title: "Status" },
          { title: "Comment" }

      ],
      /*dom: 'Bfrtip',
      buttons: [
        {extend: 'csv'}
    ]  */
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
      <div>
        <div className={styles.row}>          
          <div className={styles.columnMain}>            
            <div>
              <span>Total interviews - {this.state.AllStatus["All"]}</span>
              <a href= "https://irmyanmarcom.sharepoint.com/sites/temp-rujal/SitePages/New-Request.aspx" type ="button" className={styles.newReq}>Create New Interview Request</a>
            </div>
            <div className={styles.menuSection}>
            <ul className={styles.Menu_Ul}>
            {/* {(this.state.)?<span></span>:null}*/}
              <li>
                <a 
                    className={this.state.activeStatus == "All"?styles.active:""} 
                    href="#All"
                    onClick={() =>this.filterStatus("All")}>
                    All
                    {this.state.AllStatus["All"] !=0 && <span> ({this.state.AllStatus["All"]})</span>}
                    {/* <span> ({this.state.AllStatus["All"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "Draft"?styles.active:""}
                    href="#DR" 
                    onClick={() =>this.filterStatus("Draft")}>
                    Draft
                    {this.state.AllStatus["Draft"] !=0 && <span> ({this.state.AllStatus["Draft"]})</span>}
                    {/* <span> ({this.state.AllStatus["Draft"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "Submitted"?styles.active:""} 
                    href="#SR" 
                    onClick={() =>this.filterStatus("Submitted")}>
                    Submitted
                    {this.state.AllStatus["Submitted"] !=0 && <span> ({this.state.AllStatus["Submitted"]})</span>}
                    {/* <span> ({this.state.AllStatus["Submitted"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "TS Added"?styles.active:""} 
                    href="#TSA" 
                    onClick={() =>this.filterStatus("TS Added")}>
                    TS Added 
                    {this.state.AllStatus["TS Added"] !=0 && <span> ({this.state.AllStatus["TS Added"]})</span>}
                    {/* <span> ({this.state.AllStatus["TS Added"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "TS Selected"?styles.active:""} 
                    href="#TSS" 
                    onClick={() =>this.filterStatus("TS Selected")}>
                    TS Selected 
                    {this.state.AllStatus["TS Selected"] !=0 && <span> ({this.state.AllStatus["TS Selected"]})</span>}
                    {/* <span> ({this.state.AllStatus["TS Selected"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "TS Approved"?styles.active:""}
                    href="#STS" 
                    onClick={() =>this.filterStatus("TS Approved")}>
                    TS Approved 
                    {this.state.AllStatus["TS Approved"] !=0 && <span> ({this.state.AllStatus["TS Approved"]})</span>}
                    {/* <span> ({this.state.AllStatus["TS Approved"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "TS Finalised"?styles.active:""} 
                    href="#TSF" 
                    onClick={() =>this.filterStatus("TS Finalised")}>
                    TS Finalised 
                    {this.state.AllStatus["TS Finalised"] !=0 && <span> ({this.state.AllStatus["TS Finalised"]})</span>}
                    {/* <span> ({this.state.AllStatus["TS Finalised"]})</span> */}
                </a>
              </li>
              <li>
                <a 
                    className={this.state.activeStatus == "TS Rejected"?styles.active:""} 
                    href="#TSR" 
                    onClick={() =>this.filterStatus("TS Rejected")}>
                    TS Rejected 
                    {this.state.AllStatus["TS Rejected"] !=0 && <span> ({this.state.AllStatus["TS Rejected"]})</span>}
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
            <table id="tblResult" className="display" width="100%"></table>
          </div>
        </div>        
      </div>
    );
  }
}
