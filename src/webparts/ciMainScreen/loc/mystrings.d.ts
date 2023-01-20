declare interface ICiMainScreenWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'CiMainScreenWebPartStrings' {
  const strings: ICiMainScreenWebPartStrings;
  export = strings;
}
