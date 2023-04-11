
import pnp, { Web, SearchQuery, SearchResults, ItemAddResult } from "sp-pnp-js";
export async function UserExistInGroup(Currentuserdetails : any,GroupName: string,siteabsoluteurl: Web){
    let isCoordinator=false;
    let result = await siteabsoluteurl.siteGroups.getByName(GroupName).users.getById(Currentuserdetails.Id).get().then(async result => {
      isCoordinator=true;
    }).catch(async result => {
      isCoordinator=false;
    });
    return isCoordinator;
}