/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Archive,
  BookA,
  Car,
  ChevronsUpDown,
  Cog,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareText,
  Pin,
  Settings,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
import {
  accountMenuLinks,
  contentVariants,
  navLinks,
  sidebarVariants,
  staggerVariants,
  transitionProps,
  variants,
} from "@/constants";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import { type User as UserAuth } from "@/modules/auth/types/auth-type";
import { AuthAPI } from "@/modules/auth/api/auth-api";
import { useNotification } from "@/modules/notifications/hooks/use-notification";
import { Separator } from "@/components/ui/separator";

export const SideNavBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation().pathname;
  const { unreadCount } = useNotification(undefined, { includeGlobal: true });
  const { data: countData, isLoading } = unreadCount;
  const count = countData?.count;
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.user?.role);
  const navigate = useNavigate();

  // const { logout } = useAuth();
  // const { unreadCount } = useNotifications();
  // const { data: count, isLoading } = unreadCount;
  // const { mutate: logoutUser, isPending } = logout;

  const handleLogout = async () => {
    await AuthAPI.logout();
    navigate("/login");
  };

  // if (LoadingNotif) return "Loading..."

  // console.log(count);

  return (
    <motion.div
      className={cn("sidebar fixed left-0 z-40 h-full shrink-0 border-r")}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-white h-full shrink-0 flex-col bg-sidebar-primary/90 dark:bg-black transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0  border-b p-2">
              <div className=" mt-[1.5px] flex w-full">
                {/* Profile Section */}
                {user && (
                  <div className="p-1 border-gray-200">
                    <div
                      className={cn(
                        `flex items-center space-x-2 ${!isCollapsed && "-mt-2"}`
                      )}
                    >
                      <div
                        className={`${
                          isCollapsed && "w-7 h-7"
                        } flex items-center justify-center`}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <>
                          <div>
                            <p className="font-semibold text-sm">{`${user.firstName} ${user.lastName}`}</p>
                            <p className="text-sm text-white">
                              {user.matriculation}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className=" flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {/* Add More Links if needed */}
                    {[
                      "SUPER_ADMIN",
                      "ADMIN",
                      "MG_COB",
                      "MG_COS",
                      "MG_AGT",
                      // "GUEST",
                    ].includes(role!) && (
                      <>
                        <Link to={"/notifications"}>
                          <div
                            className={cn(
                              "flex h-8 text-white w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-white/50 hover:text-primary",
                              location?.includes("notifications") &&
                                "bg-primary/30 text-black"
                            )}
                          >
                            <div className="flex flex-row items-center">
                              <MessageSquareText className="h-4 w-4 text-white hover:text-primary" />
                              <motion.li variants={variants}>
                                {!isCollapsed && (
                                  <div className="ml-2 flex items-center  gap-2">
                                    <p className="text-sm text-white hover:text-primary font-medium">
                                      Notifications
                                    </p>
                                    {count !== undefined && count > 0 && (
                                      <Badge
                                        className={cn(
                                          "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-secondary/90 px-1.5 text-blue-600 dark:bg-blue-700 dark:text-blue-300"
                                        )}
                                        variant="outline"
                                      >
                                        {isLoading ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <p
                                            className={`${count < 1 && "hidden"} ${
                                              count <= 100 && "text-green-500"
                                            } ${
                                              (count >= 300 || count <= 400) &&
                                              "text-red-200"
                                            } ${count > 400 && "text-red-500"}`}
                                          >
                                            {count > 0 &&
                                              (count > 500 ? "500+" : count)}
                                          </p>
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </motion.li>
                            </div>
                          </div>
                        </Link>
                      </>
                    )}

                    {[
                      "SUPER_ADMIN",
                      "ADMIN",
                      "MG_COB",
                      "MG_COS",
                      "MG_AGT",
                      "GUEST",
                    ].includes(role!) && (
                      <NavBarLink
                        to={"/home"}
                        pathName={"home"}
                        isCollapsed={isCollapsed}
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        title={"Tableau de bord"}
                      />
                    )}

                    {[
                      "SUPER_ADMIN",
                      "ADMIN",
                      "MG_COB",
                      "MG_COS",
                      "MG_AGT",
                    ].includes(role!) && (
                      <>
                        <Separator className="mt-6" />

                        <NavBarLink
                          to={"/assets"}
                          pathName={"assets"}
                          isCollapsed={isCollapsed}
                          icon={<Archive className="h-4 w-4" />}
                          title={"Gestion du patrimoine"}
                        />

                        <Separator className="mb-6" />

                        {navLinks?.map((link) => (
                          <NavBarLink
                            key={link.id}
                            to={link.to}
                            pathName={link.pathName}
                            isCollapsed={isCollapsed}
                            icon={<link.icon className="h-4 w-4" />}
                            title={link.title}
                          />
                        ))}
                      </>
                    )}

                    <NavBarLink
                      to={"/my-vehicle"}
                      pathName={"my-vehicle"}
                      isCollapsed={isCollapsed}
                      icon={<Car className="h-4 w-4" />}
                      title={"Mon véhicule"}
                    />

                    <Separator className="mt-6" />
                    {/* Category management */}
                    {[
                      "SUPER_ADMIN",
                      "ADMIN",
                      //  "MG_AGT"
                    ].includes(role!) && (
                      <>
                        <NavBarLink
                          to={"/categories"}
                          pathName={"categories"}
                          isCollapsed={isCollapsed}
                          icon={<Settings className="h-4 w-4" />}
                          title={"Categories"}
                        />
                      </>
                    )}

                    {/* Location management */}
                    {["SUPER_ADMIN", "ADMIN", "MG_COB", "MG_COS"].includes(
                      role!
                    ) && (
                      <>
                        <NavBarLink
                          to={"/locations"}
                          pathName={"locations"}
                          isCollapsed={isCollapsed}
                          icon={<Pin className="h-4 w-4" />}
                          title={"Gestion des emplacements"}
                        />
                      </>
                    )}

                    {/* User management */}
                    {["SUPER_ADMIN", "ADMIN", "MG_COB", "MG_COS"].includes(
                      role!
                    ) && (
                      <>
                        <NavBarLink
                          to={"/users"}
                          pathName={"users"}
                          isCollapsed={isCollapsed}
                          icon={<Users className="h-4 w-4" />}
                          title={"Gestion des utilisateurs"}
                        />
                      </>
                    )}
                    <Separator className="mb-6" />

                    {/* User management */}
                    {["SUPER_ADMIN", "ADMIN", "MG_COB", "MG_COS"].includes(
                      role!
                    ) && (
                      <>
                        <NavBarLink
                          to={"/providers"}
                          pathName={"providers"}
                          isCollapsed={isCollapsed}
                          icon={<BookA className="h-4 w-4" />}
                          title={"Annuaire fournisseurs"}
                        />
                      </>
                    )}

                    {/* <Separator className="mt-6" /> */}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col p-2">
                {/* Add More Variables if needed */}

                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5  transition hover:bg-background/80 hover:text-foreground cursor-pointer">
                        <Avatar className="size-6 -ml-1">
                          <AvatarFallback className="bg-transparent ">
                            <Cog className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Paramètres</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      {user && <AvatarIcon {...user} />}
                      <DropdownMenuSeparator />
                      {accountMenuLinks?.map((link) => (
                        <AccountMenuLink
                          key={link.title}
                          to={link.to}
                          icon={<link.icon className="h-4 w-4" />}
                          title={link.title}
                        />
                      ))}

                      <AccountMenuLink
                        to={"/help"}
                        icon={<HelpCircle className="h-4 w-4" />}
                        title={"Centre d'aide"}
                      />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" /> Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <img
                  src="/anac.png"
                  className={`${isCollapsed ? "hidden" : "block"} bg-white rounded-lg py-1 mt-4 transition-all duration-300 ease-in-out`}
                />
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

interface NavLinkProps {
  pathName: string;
  isCollapsed: boolean;

  to: string;
  icon: React.ReactNode;
  title: string;
}

const NavBarLink = ({
  pathName,
  isCollapsed,
  to,
  icon,
  title,
}: NavLinkProps) => {
  const location = useLocation().pathname;

  return (
    <NavLink
      to={to}
      className={cn(
        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-background hover:text-foreground",
        location.includes(pathName) && "bg-background text-primary"
      )}
    >
      <div className="flex flex-row items-center">
        {icon}
        <motion.li variants={variants}>
          {!isCollapsed && <p className="ml-2 text-sm font-medium">{title}</p>}
        </motion.li>
      </div>
    </NavLink>
  );
};

interface AccountLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
}

const AccountMenuLink = ({ to, icon, title }: AccountLinkProps) => {
  return (
    <DropdownMenuItem
      asChild
      className="cursor-pointer flex items-center gap-2"
    >
      <Link to={to}>
        <div className="flex gap-2 flex-row items-center">
          {icon}
          {title}
        </div>
      </Link>
    </DropdownMenuItem>
  );
};

export const AvatarIcon = (user: UserAuth) => {
  const isDeleted = user.isDeleted;

  const identity =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  return (
    <div
      className={
        "flex flex-row items-center gap-2 p-2 " +
        `${isDeleted && "bg-gray-50 rounded-xl border text-muted-foreground line-through"}`
      }
    >
      <Avatar className="size-6">
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} />
        ) : (
          <AvatarFallback>{identity.slice(0, 1)}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-col text-left">
        <span className="text-sm font-medium">{identity}</span>
        <span className="line-clamp-1 text-xs text-muted-foreground">
          {user.matriculation}
        </span>
      </div>
    </div>
  );
};
