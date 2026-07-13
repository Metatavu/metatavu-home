import {
  AccessTimeOutlined,
  AnalyticsOutlined,
  AppRegistration,
  AppsOutlined,
  BeachAccessOutlined,
  BrowseGalleryOutlined,
  DescriptionOutlined,
  DesignServicesOutlined,
  EditCalendarOutlined,
  Groups3Outlined,
  HomeOutlined,
  QuizOutlined,
  SettingsPhoneOutlined,
  ViewKanbanOutlined
} from "@mui/icons-material";
import strings from "src/localization/strings";

export const getEmployeeMenu = () => [
  {
    title: strings.navigation.home,
    icon: HomeOutlined,
    route: "/"
  },
  {
    title: strings.navigation.sprint,
    icon: ViewKanbanOutlined,
    route: "/sprintview"
  },
  {
    title: strings.navigation.balance,
    icon: AccessTimeOutlined,
    route: "/balance"
  },
  {
    title: strings.navigation.vacations,
    icon: BeachAccessOutlined,
    route: "/vacations"
  },
  {
    title: strings.navigation.wiki,
    icon: DescriptionOutlined,
    route: "/wiki-documentation"
  },
  {
    title: strings.navigation.questionnaires,
    icon: QuizOutlined,
    route: "/questionnaire"
  },
  {
    title: strings.navigation.onCall,
    icon: SettingsPhoneOutlined,
    route: "/oncall"
  },
  {
    title: strings.navigation.applications,
    icon: AppsOutlined,
    route: "/softwareregistry"
  },
  {
    title: strings.navigation.employees,
    icon: Groups3Outlined,
    route: ""
  }
];

export const getManagementMenu = () => [
  {
    title: strings.navigation.project,
    icon: AnalyticsOutlined,
    route: "/admin"
  },
  {
    title: strings.navigation.employeeBalance,
    icon: BrowseGalleryOutlined,
    route: "/admin/severa/employee-flextime"
  },
  {
    title: strings.navigation.vacationManager,
    icon: EditCalendarOutlined,
    route: "/admin/vacations"
  },
  {
    title: strings.navigation.questionnarieBuilder,
    icon: DesignServicesOutlined,
    route: "/admin/questionnaire"
  },
  {
    title: strings.navigation.applicationsManager,
    icon: AppRegistration,
    route: "/admin/allsoftware"
  }
];
