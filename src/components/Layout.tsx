import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  // Navigation & UI Icons
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon, // Logout
  ChevronDownIcon,

  // Dashboard & Admin Icons
  Squares2X2Icon, // Dashboard
  UsersIcon, // User Management
  UserPlusIcon,
  UserGroupIcon,

  // Category Icons
  TagIcon, // Categories
  PlusCircleIcon,
  ListBulletIcon,

  // Product & Inventory Icons
  CubeIcon, // Inventory
  PlusIcon,
  TableCellsIcon, // Product Catalog

  // Orders & Security
  ClipboardDocumentListIcon, // Orders
} from "@heroicons/react/24/outline";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo2.png";

// --- Types ---
interface SubMenuItem {
  title: string;
  src: string;
  icon: React.ElementType;
}

interface MenuItem {
  title: string;
  src?: string;
  icon: React.ElementType;
  gap?: boolean;
  current?: boolean;
  subMenus?: SubMenuItem[];
}

interface Navigation {
  [key: string]: MenuItem[];
}

export default function Layout() {
  const role = localStorage.getItem("role");
  const access_token = localStorage.getItem("access_token");
  const user_name = localStorage.getItem("user_name");

  // --- Theme State & Logic ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // --- Logic Preserved ---
  const navigation: Navigation = {
    admin: [
      {
        title: "Dashboard",
        src: "/admin-home",
        icon: Squares2X2Icon,
      },
      {
        title: "User Management",
        icon: UsersIcon,
        subMenus: [
          { title: "Add User", src: "/add-user", icon: UserPlusIcon },
          { title: "All Users", src: "/list-user", icon: UserGroupIcon },
        ],
      },
      {
        title: "Categories",
        icon: TagIcon,
        subMenus: [
          { title: "New Category", src: "/add-category", icon: PlusCircleIcon },
          {
            title: "Category List",
            src: "/list-category",
            icon: ListBulletIcon,
          },
        ],
      },
      {
        title: "Inventory",
        icon: CubeIcon,
        subMenus: [
          { title: "Add Product", src: "/add-product", icon: PlusIcon },
          {
            title: "Product Catalog",
            src: "/list-product",
            icon: TableCellsIcon,
          },
        ],
      },
      {
        title: "Orders & Sales",
        icon: ClipboardDocumentListIcon,
        subMenus: [
          {
            title: "View All Orders",
            src: "/list-orders",
            icon: ListBulletIcon,
          },
        ],
      },
    ],
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menu, setMenu] = useState<Navigation>(navigation);

  useEffect(() => {
    if (!role || !access_token) {
      navigate("/login");
    } else {
      if (role === "admin" && pathname === "/") {
        navigate("/admin-home");
      }
    }
    const updatedMenu = { ...navigation };
    if (role && updatedMenu[role]) {
      updatedMenu[role].forEach((item) => {
        if (item.subMenus) {
          item.current = !!item.subMenus.find((sub) => sub.src === pathname);
        }
      });
    }
    setMenu(updatedMenu);
  }, [navigate, role, access_token, pathname]);

  const toggleSubmenu = (role: string, index: number) => {
    setMenu((prevMenu) => {
      const updatedMenu = { ...prevMenu };
      const menuItems = updatedMenu[role];
      menuItems.forEach((item, i) => {
        if (i !== index) item.current = false;
      });
      if (menuItems[index]) {
        menuItems[index].current = !menuItems[index].current;
      }
      return updatedMenu;
    });
  };

  // --- Helper Component: NavItem (Refactored to match Image) ---
  const NavItem = ({
    item,
    index,
    isMobile = false,
  }: {
    item: MenuItem;
    index: number;
    isMobile?: boolean;
  }) => {
    // 1. Determine states
    const isActiveParent = item.subMenus && item.current; // Parent is open (e.g. User Management)
    const isActiveLink = !item.subMenus && item.src === pathname; // Direct link is active (e.g. Dashboard)

    return (
      <li className="mb-1.5">
        {/* Main Menu Button */}
        <button
          className={`group flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
            ${
              // CASE 1: Single Active Link (Dashboard) -> Subtle gradient
              isActiveLink
                ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-sm dark:from-zinc-100 dark:to-zinc-200 dark:text-black"
                : // CASE 2: Active Parent (User Management Open) -> Light background
                  isActiveParent
                  ? "bg-gray-100/80 text-gray-900 dark:bg-zinc-800/50 dark:text-white"
                  : // CASE 3: Inactive -> Subtle hover
                    "text-gray-600 hover:bg-gray-100/60 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900/40 dark:hover:text-white"
            }`}
          onClick={() => {
            if (item.subMenus) {
              toggleSubmenu(role as string, index);
            } else if (item.src) {
              navigate(item.src);
              if (isMobile) setSidebarOpen(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <item.icon
              className={`h-5 w-5 transition-colors ${
                isActiveLink
                  ? "text-white dark:text-black"
                  : isActiveParent
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 group-hover:text-gray-700 dark:text-zinc-500 dark:group-hover:text-zinc-300"
              }`}
            />
            <span>{item.title}</span>
          </div>
          {item.subMenus && (
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-500 dark:text-zinc-500 transition-transform duration-200 ${
                item.current ? "rotate-180 text-gray-900 dark:text-white" : ""
              }`}
            />
          )}
        </button>

        {/* Submenu List */}
        <Transition
          show={!!item.current}
          enter="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
          enterFrom="max-h-0 opacity-0 -translate-y-2"
          enterTo="max-h-[500px] opacity-100 translate-y-0"
          leave="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
          leaveFrom="max-h-[500px] opacity-100 translate-y-0"
          leaveTo="max-h-0 opacity-0 -translate-y-2"
        >
          <div className="mt-1 space-y-0.5">
            {/* Note: Vertical Line Removed to match image */}

            {item.subMenus?.map((subItem, idx) => {
              const isActiveSub = subItem.src === pathname;
              return (
                <Link
                  to={subItem.src}
                  key={idx}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative group
                    ${
                      // Submenu Item Active State -> Subtle background
                      isActiveSub
                        ? "bg-gray-100/80 text-gray-900 dark:bg-zinc-800/40 dark:text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900/30"
                    }`}
                >
                  {/* Dot Indicator for Active Submenu Item */}
                  <div className="absolute left-[22px] flex items-center justify-center w-4">
                    <div
                      className={`rounded-full transition-all duration-200 ${
                        isActiveSub
                          ? "h-1.5 w-1.5 bg-gray-900 dark:bg-white ring-2 ring-gray-200 dark:ring-zinc-700"
                          : "h-1 w-1 bg-gray-400 group-hover:bg-gray-600 dark:bg-zinc-600 dark:group-hover:bg-zinc-400"
                      }`}
                    />
                  </div>

                  <span>{subItem.title}</span>
                </Link>
              );
            })}
          </div>
        </Transition>
      </li>
    );
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-zinc-100 transition-colors duration-500">
      {/* --- Injected Styles for Smooth Animation --- */}
      <style>{`
        @keyframes smoothFadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition {
          animation: smoothFadeInUp 0.4s ease-out forwards;
        }
      `}</style>

      {/* --- Mobile Sidebar --- */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-80 max-w-xs flex-1 flex-col bg-white dark:bg-black shadow-xl">
                <div className="flex items-center justify-between px-6 py-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={Logo}
                      alt="Logo"
                      className="h-8 w-auto dark:invert transition-all duration-300"
                    />
                    <span className="text-gray-900 dark:text-white font-bold text-xl tracking-tight">
                      TStocks
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-4 overflow-y-auto">
                  <ul className="space-y-1">
                    {role &&
                      menu[role]?.map((item, index) => (
                        <NavItem
                          key={index}
                          item={item}
                          index={index}
                          isMobile={true}
                        />
                      ))}
                  </ul>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* --- Desktop Sidebar --- */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white dark:bg-zinc-950 border-r border-gray-200/60 dark:border-zinc-800/60 z-40 transition-colors duration-500">
        <div className="flex items-center gap-3 h-20 px-8 border-b border-gray-200/60 dark:border-zinc-800/60">
          {/* <img src={Logo} alt="Logo" className="h-8 w-auto dark:invert transition-all duration-500" /> */}
          <span className="text-gray-900 dark:text-white font-semibold text-xl tracking-tight">
            T-Stocks
          </span>
        </div>

        {/* User Role Card - Clean Design */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/60 dark:from-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-800/60 shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-black text-xs font-semibold shadow-sm">
              {role ? role.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-wider font-medium">
                Workspace
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-semibold capitalize">
                {role || "User"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {role &&
              menu[role]?.map((item, index) => (
                <NavItem key={index} item={item} index={index} />
              ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200/60 dark:border-zinc-800/60">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="flex items-center w-full px-3.5 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50/80 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Log out
          </button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72 transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-x-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 border-b border-gray-200/60 dark:border-zinc-800/60 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-600 dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white capitalize tracking-tight">
                {pathname === "/admin-home"
                  ? "Dashboard"
                  : pathname.replace("/", "").replace("-", " ")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 transition-all rounded-lg"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
              )}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800" />

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-black font-semibold text-sm shadow-sm">
                {user_name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full bg-gray-50/30 dark:bg-zinc-950/30 transition-colors duration-500">
          <div key={pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* --- Profile Slide-over --- */}
      <Transition show={isProfileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsProfileOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="w-screen max-w-md pointer-events-auto">
                    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 shadow-2xl">
                      <div className="flex items-start justify-between px-6 py-6 border-b border-gray-100 dark:border-zinc-900">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                          Profile
                        </Dialog.Title>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      {/* Simple Profile Content */}
                      <div className="flex-1 px-8 py-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-16 w-16 rounded-full bg-black dark:bg-white flex items-center justify-center text-2xl font-bold text-white dark:text-black">
                            {user_name?.charAt(0).toUpperCase() ?? "U"}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                              {user_name}
                            </h2>
                            <p className="text-sm text-gray-500 capitalize">
                              {role}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.clear();
                            navigate("/login");
                          }}
                          className="w-full py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
