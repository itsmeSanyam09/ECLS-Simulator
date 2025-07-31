import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { List, SquarePlus, Presentation,GraduationCap } from "lucide-react";
import ecgIcon from "/ecg-icon.png";
import {
  CREATE_PATTERN_ROUTE,
  WAVE_LIST_ROUTE,
  CREATE_SESSION_ROUTE,
  WATCH_SESSION_ROUTE
} from "../../constants/Route.constant";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <List />,
    name: "Wave List",
    path: WAVE_LIST_ROUTE,
  },
  {
    icon: <SquarePlus />,
    name: "Add Wave Pattern",
    path: CREATE_PATTERN_ROUTE,
  },
  {
    icon: <Presentation />,
    name: "Trainer",
    path: CREATE_SESSION_ROUTE
  },
  {
    icon: <GraduationCap />,
    name: "Trainee",
    path: WATCH_SESSION_ROUTE,
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded } = useSidebar();

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link to={nav.path} className={"menu-item group"}>
              <span className={"menu-item-icon-size"}>{nav.icon}</span>
              {isExpanded && <span className="menu-item-text">{nav.name}</span>}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded ? "w-[290px]" : "w-[90px]"}
        ${"-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-6 flex ${
          !isExpanded ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <img
            className="dark:hidden"
            src={ecgIcon}
            alt="Logo"
            width={50}
            height={40}
          />
          {isExpanded && <div className="text-2xl">ECLS Simulator</div>}
        </Link>
      </div>
      <div className="mt-4 flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>{renderMenuItems(navItems)}</div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
