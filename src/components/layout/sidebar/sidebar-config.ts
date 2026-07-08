import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import App_registration from "@mui/icons-material/AppRegistration";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import Brows_galary from "@mui/icons-material/BrowseGallery";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Design_services from "@mui/icons-material/DesignServices";
import home from "@mui/icons-material/Home";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";

export const employeeMenu = [
  {
    title: "Home",
    icon: home,
    route: "/"
  },
  {
    title: "Sprint View",
    icon: ViewKanbanOutlinedIcon,
    route: "/sprintview"
  },
  {
    title: "Balance",
    icon: AccessTimeOutlinedIcon,
    route: "/balance"
  },
  {
    title: "Vacation Requests",
    icon: BeachAccessOutlinedIcon,
    route: "/vacations"
  },
  {
    title: "Wiki Documentation",
    icon: DescriptionOutlinedIcon,
    route: "/wiki-documentation"
  },
  {
    title: "Questionnaires",
    icon: QuizOutlinedIcon,
    route: "/questionnaire"
  },
  {
    title: "Software Registry",
    icon: AppsOutlinedIcon,
    route: "/softwareregistry"
  },
  {
    title: "On Call Calendar",
    icon: PhoneOutlinedIcon,
    route: "/oncall"
  }
];

export const managementMenu = [
  {
    title: "Project Overview",
    icon: AssessmentOutlinedIcon,
    route: "/admin"
  },
  {
    title: "Employee Balance",
    icon: Brows_galary,
    route: "/admin/severa/employee-flextime"
  },
  {
    title: "Vacation Manager",
    icon: BeachAccessOutlinedIcon,
    route: "/admin/vacation-management"
  },
  {
    title: "Questionnaire Builder",
    icon: Design_services,
    route: "/admin/questionnaire"
  },
  {
    title: "Application Manager",
    icon: App_registration,
    route: "/admin/allsoftware"
  }
];
